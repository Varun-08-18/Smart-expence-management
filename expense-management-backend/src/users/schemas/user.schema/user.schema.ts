import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// User document ka TypeScript type
export type UserDocument = HydratedDocument<User>;

// User ka MongoDB schema
@Schema({ timestamps: true })
export class User {
  // User ka naam
  @Prop({ required: true, trim: true })
  name: string;

  // Email unique hona chahiye
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  // Hashed password store hoga, plain password nahi
  @Prop({ required: true, select: false })
  password: string;

  // User ka role
  @Prop({
    required: true,
    enum: ['Employee', 'Admin'],
    default: 'Employee',
  })
  role: string;
}

// Schema ko Mongoose model ke liye convert karo
export const UserSchema = SchemaFactory.createForClass(User);
