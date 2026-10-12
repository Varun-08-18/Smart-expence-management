import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

// Registration request ke data ko validate karne ke liye DTO
export class RegisterDto {
  // User ka naam string hona chahiye
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  // Valid email hona chahiye
  @IsEmail()
  email: string;

  // Password minimum 8 characters ka hona chahiye
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
