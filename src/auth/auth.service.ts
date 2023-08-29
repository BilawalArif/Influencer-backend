import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { User } from 'src/schemas/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';

import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/utils/generateToken';
import { VerifyAccountMailService } from './mails/verifyAccount.mail.service';
import { ResetPasswordMailService } from './mails/resetPassword.mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private tokenService: TokenService,

    private verifyAccountMailService: VerifyAccountMailService,
    private resetPasswordMailService: ResetPasswordMailService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async createAndSaveUser(userDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const createdUser = this.createAndSaveUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser;
  }

  private async createGoogleUser(createUserDto: CreateUserDto): Promise<User> {
    const { isVerified } = createUserDto;
    const verified = !isVerified;
    const hashedPassword = await this.hashPassword(createUserDto.password);

    return new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: verified,
    });
  }

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }
    return user;
  }

  async comparePassword(
    password: string,
    newPassword: string,
  ): Promise<boolean> {
    const passwordValid = await bcrypt.compare(password, newPassword);
    return passwordValid;
  }

  async saveGoogleUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.createGoogleUser(createUserDto);

    try {
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      throw new Error('Failed to save user');
    }
  }

  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    googleAuthToken: any;
  }> {
    const accessToken = await this.tokenService.generateAccessToken(
      user?._id,
      user?.username,
      user?.role,
    );
    const refreshToken = await this.tokenService.generateRefreshToken(
      user?._id,
      user?.username,
      user?.role,
    );
    const googleAuthToken = await this.tokenService.generateGoogleLoginToken(
      user ? user : undefined,
    );

    return { accessToken, refreshToken, googleAuthToken };
  }

  setAuthorizationHeader(res: Response, token: string): void {
    res.set('authorization', token);
  }

  sendSignupResponse(res: Response, user: User): void {
    res.status(200).json({
      user,
      message: 'User created. Check your email for verification.',
    });
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = await this.tokenService.generateVerificationToken(
      user,
    );
    await this.verifyAccountMailService.verificationEmail(
      user.email,
      verificationToken,
    );
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (user) {
      const resetPasswordToken =
        await this.tokenService.generateResetPasswordToken(user);
      await this.resetPasswordMailService.passwordResetEmail(
        user.email,
        resetPasswordToken,
      );
    }
  }
}
export interface IAuthService {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  getUser(username: string): Promise<User | undefined>;
  comparePassword(password: string, newPassword: string): Promise<boolean>;
}
