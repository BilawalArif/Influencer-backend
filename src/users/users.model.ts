import * as mongoose from 'mongoose';
import { Role } from 'src/enums/role.enum';
export const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role), // Use the values from the Role enum
      default: Role.Influencer, // Default role if not specified
    },
  },
  { timestamps: true },
);

export interface User extends mongoose.Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: number;
  age: number;
  role: Role;
}
