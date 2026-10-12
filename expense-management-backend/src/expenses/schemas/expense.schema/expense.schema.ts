import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument ,Types } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({
    required: true,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft',
  })
  status: string;
  @Prop({
  type: Types.ObjectId,
  ref: 'User',
  required: true,
})
employeeId: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
