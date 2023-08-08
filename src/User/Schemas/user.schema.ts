import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: [true, 'Please enter Your Name'],
    maxLength: [30, 'Name must be at least 30 characters'],
    minLength: [3, 'Name must be at least 3 characters'],
  })
  fullName: string;

  @Prop({
    required: [true, 'Please enter Your email'],
    unique: true,
  })
  email: string;

  @Prop({
    required: [true, 'Please enter Your Password'],
    minLength: [8, 'Name must be at least 8 characters'],
    select: false,
  })
  password: string;

  @Prop({
    required: [true, 'Please enter Your Age'],
  })
  age: number;
  @Prop({
    required: [true, 'Please enter Your phoneNumber'],
  })
  phoneNumber: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
