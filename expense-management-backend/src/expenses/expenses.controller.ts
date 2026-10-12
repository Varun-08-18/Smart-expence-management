import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/create-expense.dto/update-expense.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles/roles.decorator.js';

// JWT strategy se request.user mein ye fields aati hain
type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    role: 'Employee' |  'Admin';
  };
};

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // Logged-in user ke naam par expense create karo
  @Post()
  create(
    @Body() dto: CreateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.create(dto, req.user.userId);
  }

  // Employee: apne expenses
  // Manager: apne + submitted expenses
  // Admin: sabhi expenses
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy = 'date',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.expensesService.findAll(
      search,
      status,
      category,
      Number(page),
      Number(limit),
      sortBy,
      order,
      req.user.userId,
      req.user.role,
    );
  }

 @UseGuards(JwtAuthGuard)
@Get(':id')
findOne(
  @Param('id') id: string,
  @Req()
  req: Request & {
    user: {
      userId: string;
      email: string;
      role: string;
    };
  },
) {
  return this.expensesService.findOne(
    id,
    req.user.userId,
    req.user.role,
  );
}

  // Owner eligible expense edit kar sakta hai; Admin bhi manage kar sakta hai
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.update(
      id,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  // Owner ya Admin eligible expense delete kar sakte hain
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.remove(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // Sirf owner apna rejected expense resubmit kare
  @Post(':id/resubmit')
  resubmit(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.resubmit(id, req.user.userId);
  }

  // Manager/Admin approval endpoints access kar sakte hain
  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles( 'Admin')
  approve(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.approve(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  reject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.reject(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // Owner apna Draft submit kare
  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.submit(id, req.user.userId);
  }


}
