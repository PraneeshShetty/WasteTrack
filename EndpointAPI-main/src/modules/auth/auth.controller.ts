import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { User } from "../user/schemas/user.schema";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { RoleService } from "../roles/role.service";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginUserDto): Promise<{ token: string, user: UserDto }> {
    if (!body || !body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const { email, password } = body;
      const { token, user } = await this.authService.loginUser(email, password);

      if (!token || !user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return { token, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

  @Post('register')
  async register(@Body() body: CreateUserDto): Promise<UserDto> {
    // Validate required fields
    if (!body || !body.email || !body.password || !body.firstname || !body.lastname) {
      throw new BadRequestException('Required fields are missing. Please provide email, password, firstname, and lastname.');
    }

    try {
      // Check if user already exists
      const existingUser = await this.userService.getUserByEmail(body.email);
      if (existingUser) {
        throw new BadRequestException('Email already registered. Please use a different email.');
      }

      // Get default role for new user
      const defaultRole = await this.roleService.getDefaultRole();
      if (!defaultRole) {
        throw new BadRequestException('User role configuration error. Please contact administrator.');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      if (!hashedPassword) {
        throw new BadRequestException('Error processing password. Please try again.');
      }

      // Create new user
      const user = new User();
      user.firstname = body.firstname;
      user.lastname = body.lastname;
      user.email = body.email;
      user.location = body.location || '';
      user.password = hashedPassword;
      user.roleId = defaultRole._id;
      user.createdAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();

      // Save user
      const createdUser = await this.userService.createUser(user);
      if (!createdUser) {
        throw new BadRequestException('Failed to create user. Please try again.');
      }

      return new UserDto(createdUser);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Registration failed. Please try again.'
      );
    }
  }
}
