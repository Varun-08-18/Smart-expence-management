import { IsEmail, IsString, MinLength } from 'class-validator';

// Login request ke data ko validate karne ke liye
export class LoginDto {
  // Valid email hona chahiye
  @IsEmail()
  email: string;

  // Password minimum 8 characters ka hona chahiye
  @IsString()
  @MinLength(8)
  password: string;
}
