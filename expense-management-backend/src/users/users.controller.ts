import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { RegisterDto } from './/dto/register.dto/register.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/register
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    // Validated data service ko bhejo
    return this.usersService.register(registerDto);
  }
}
