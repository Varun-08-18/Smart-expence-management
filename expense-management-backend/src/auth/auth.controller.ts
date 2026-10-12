
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    // Login request AuthService ko bhejo
    return this.authService.login(loginDto);
  }
}
