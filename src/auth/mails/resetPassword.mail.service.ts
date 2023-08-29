import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.model';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordMailService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async passwordResetEmail(
    email: string,
    resetPasswordToken: string,
  ): Promise<void> {
    // Send email with reset link containing the token
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service provider here (e.g., 'Gmail', 'Outlook')
      auth: {
        user: process.env.NODEMAILER_EMAIL, // Your email address
        pass: process.env.NODEMAILER_PASSWORD, // Your email password or an app-specific password
      },
    });

    const resetPasswordLink = `${process.env.BASE_URL}/auth/reset-password?email=${email}&token=${resetPasswordToken}`;
    const message = `<html>
          <head>
            <title>Forgot Password</title>
          </head>
          <body>
            <h1>Reset Your Password</h1>
            <p>Please click the following link to reset your password:</p>
            <a href="${resetPasswordLink}">${resetPasswordLink}</a>
           </body>
          </html>`;
    const mailOptions = {
      to: email,
      from: process.env.NODEMAILER_EMAIL,
      subject: 'Forgot Password',
      html: message,
      headers: {
        'Content-Type': 'text/html',
      },
    };

    await transporter.sendMail(mailOptions);
  }

  // UserService.ts
  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      email: email,
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();
    } else {
      throw new NotFoundException('Invalid or expired token');
    }
  }
}
