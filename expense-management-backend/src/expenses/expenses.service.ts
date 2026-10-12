import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Expense,
  ExpenseDocument,
} from './schemas/expense.schema/expense.schema.js';
import { CreateExpenseDto } from './dto/create-expense.dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/create-expense.dto/update-expense.dto.js';

type UserRole = 'Employee' | 'Manager' | 'Admin';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  // Invalid MongoDB ID ko reject karo
  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid expense ID');
    }
  }

  // Expense find karo, nahi mila toh 404
  private async getExpense(id: string) {
    this.validateId(id);

    const expense = await this.expenseModel.findById(id).exec();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  // Check karo user expense ka owner hai ya Admin
  private ensureOwnerOrAdmin(
    expense: ExpenseDocument,
    userId: string,
    role: UserRole,
  ) {
    const isOwner = expense.employeeId?.toString() === userId;

    if (!isOwner && role !== 'Admin') {
      throw new ForbiddenException(
        'You cannot access another employee expense',
      );
    }
  }

  // Sirf eligible Draft/Rejected expenses edit/delete ho sakte hain
  private ensureEditable(expense: ExpenseDocument) {
    if (expense.status === 'Approved') {
      throw new BadRequestException(
        'Approved expense cannot be edited',
      );
    }

    if (!['Draft', 'Rejected'].includes(expense.status)) {
      throw new BadRequestException(
        'Only Draft or Rejected expenses can be edited',
      );
    }
  }

  // Naya expense logged-in employee ke naam par banao
  async create(dto: CreateExpenseDto, employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const expenseDate = new Date(dto.date);

    if (expenseDate > new Date()) {
      throw new BadRequestException(
        'Expense date cannot be in the future',
      );
    }

    const expense = new this.expenseModel({
      ...dto,
      date: expenseDate,
      employeeId: new Types.ObjectId(employeeId),
      status: 'Draft',
    });

    return expense.save();
  }

  // Search, filters, pagination aur role-based visibility
  async findAll(
    search?: string,
    status?: string,
    category?: string,
    page = 1,
    limit = 10,
    sortBy = 'date',
    order: 'asc' | 'desc' = 'desc',
    userId?: string,
    role: UserRole = 'Employee',
  ) {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid authenticated user');
    }

    const filter: Record<string, any> = {};

    // Employee sirf apne expenses dekhe
    if (role === 'Employee') {
      filter.employeeId = new Types.ObjectId(userId);
    }

    // Manager apne expenses aur doosron ke Submitted expenses dekhe
    if (role === 'Manager') {
      filter.$or = [
        { employeeId: new Types.ObjectId(userId) },
        { status: 'Submitted' },
      ];
    }

    // Admin par employee visibility restriction nahi hai
    if (search?.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: 'i',
      };
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    page = Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1;

    limit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 10;

    const sortOrder = order === 'asc' ? 1 : -1;
    const safeSortField = sortBy === 'amount' ? 'amount' : 'date';

    const total = await this.expenseModel
      .countDocuments(filter)
      .exec();

    const expenses = await this.expenseModel
      .find(filter)
      .sort({ [safeSortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

async findOne(id: string, userId: string, role: string) {
  this.validateId(id);

  const expense = await this.expenseModel.findById(id);

  if (!expense) {
    throw new NotFoundException('Expense not found');
  }

  // Employee sirf apna expense dekh sakta hai
  if (
    role === 'Employee' &&
    expense.employeeId.toString() !== userId
  ) {
    throw new ForbiddenException(
      'You can only view your own expenses',
    );
  }

  // Manager submitted expenses dekh sakta hai
  if (
    role === 'Manager' &&
    expense.status !== 'Submitted'
  ) {
    throw new ForbiddenException(
      'Managers can only view submitted expenses',
    );
  }

  return expense;
}

  // Expense update: owner ya Admin, status rules ke saath
  async update(
    id: string,
    dto: UpdateExpenseDto,
    userId: string,
    role: UserRole,
  ) {
    const expense = await this.getExpense(id);

    this.ensureOwnerOrAdmin(expense, userId, role);
    this.ensureEditable(expense);

    // Date di gayi hai toh future date reject karo
    if (dto.date !== undefined) {
      const updatedDate = new Date(dto.date);

      if (Number.isNaN(updatedDate.getTime())) {
        throw new BadRequestException('Invalid expense date');
      }

      if (updatedDate > new Date()) {
        throw new BadRequestException(
          'Expense date cannot be in the future',
        );
      }

      expense.date = updatedDate;
    }

    // Client employeeId ya status change nahi kar sakta
    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.category !== undefined) expense.category = dto.category;

    // Rejected expense edit ke baad Rejected hi rahega;
    // explicit resubmit endpoint se hi Submitted hoga.
    return expense.save();
  }

  // Delete: owner ya Admin, lekin Submitted/Approved nahi
  async remove(id: string, userId: string, role: UserRole) {
    const expense = await this.getExpense(id);

    this.ensureOwnerOrAdmin(expense, userId, role);

    if (!['Draft', 'Rejected'].includes(expense.status)) {
      throw new BadRequestException(
        'Only Draft or Rejected expenses can be deleted',
      );
    }

    await expense.deleteOne();

    return {
      message: 'Expense deleted successfully',
      expense,
    };
  }

  // Sirf owner rejected expense ko resubmit kare
  async resubmit(id: string, userId: string) {
    const expense = await this.getExpense(id);
    this.ensureOwnerOrAdmin(expense, userId, 'Employee');

    if (expense.employeeId?.toString() !== userId) {
      throw new ForbiddenException(
        'Only the expense owner can resubmit it',
      );
    }

    if (expense.status !== 'Rejected') {
      throw new BadRequestException(
        'Only rejected expenses can be resubmitted',
      );
    }

    expense.status = 'Submitted';
    return expense.save();
  }

  // Manager/Admin Submitted expense approve karein.
  // Apna expense khud approve nahi kar sakte.
  async approve(id: string, userId: string, role: UserRole) {
    const expense = await this.getExpense(id);

    if (!['Manager', 'Admin'].includes(role)) {
      throw new ForbiddenException(
        'Only Manager or Admin can approve expenses',
      );
    }

    if (expense.employeeId?.toString() === userId) {
      throw new ForbiddenException(
        'You cannot approve your own expense',
      );
    }

    if (expense.status !== 'Submitted') {
      throw new BadRequestException(
        'Only submitted expenses can be approved',
      );
    }

    expense.status = 'Approved';
    return expense.save();
  }

  // Manager/Admin Submitted expense reject karein.
  // Apna expense khud reject nahi kar sakte.
  async reject(id: string, userId: string, role: UserRole) {
    const expense = await this.getExpense(id);

    if (!['Manager', 'Admin'].includes(role)) {
      throw new ForbiddenException(
        'Only Manager or Admin can reject expenses',
      );
    }

    if (expense.employeeId?.toString() === userId) {
      throw new ForbiddenException(
        'You cannot reject your own expense',
      );
    }

    if (expense.status !== 'Submitted') {
      throw new BadRequestException(
        'Only submitted expenses can be rejected',
      );
    }

    expense.status = 'Rejected';
    return expense.save();
  }

  // Sirf owner Draft expense submit kare
  async submit(id: string, userId: string) {
    const expense = await this.getExpense(id);

    this.ensureOwnerOrAdmin(expense, userId, 'Employee');

    if (expense.employeeId?.toString() !== userId) {
      throw new ForbiddenException(
        'Only the expense owner can submit it',
      );
    }

    if (expense.status !== 'Draft') {
      throw new BadRequestException(
        'Only draft expenses can be submitted',
      );
    }

    expense.status = 'Submitted';
    return expense.save();
  }
}
