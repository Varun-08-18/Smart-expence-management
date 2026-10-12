import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';
import { Expense, ExpenseSchema } from './schemas/expense.schema/expense.schema.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, RolesGuard],
  
})
export class ExpensesModule {}
