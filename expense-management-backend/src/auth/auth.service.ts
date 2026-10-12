import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // User ko login karne ke liye
  async login(loginDto: LoginDto) {
    // Email ke through user find karo
    const user = await this.usersService.findByEmail(
      loginDto.email,
    );

    // User nahi mila toh login reject karo
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Enter kiya password aur database ke hash ko compare karo
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    // Password galat hai toh login reject karo
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT payload mein user ki ID, email aur role rakho
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // JWT token generate karke client ko return karo
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
    };
  }
}
