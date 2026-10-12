import {
  IsDateString,
  IsNumber,
  IsString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @IsDateString()
  date: string;
}
