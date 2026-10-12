import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema/user.schema.js';
import { RegisterDto } from './dto/register.dto/register.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Naya user register karne ke liye
  async register(registerDto: RegisterDto) {
    // Email ko lowercase mein convert karo
    const email = registerDto.email.toLowerCase().trim();

    // Check karo ki email pehle se registered toh nahi hai
    const existingUser = await this.userModel
      .findOne({ email })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Password ko hash karo
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    // Naya user create karo; role server set karega
    const user = await this.userModel.create({
      name: registerDto.name,
      email,
      password: hashedPassword,
      role: 'Employee',
    });

    // Password response mein return mat karo
    return {
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  // Email se user ko database mein find karne ke liye
async findByEmail(email: string) {
  // Email ko lowercase aur trim karo
  const normalizedEmail = email.toLowerCase().trim();

  // Password hidden hai, isliye use explicitly fetch karo
  return this.userModel
    .findOne({ email: normalizedEmail })
    .select('+password')
    .exec();
}
}
