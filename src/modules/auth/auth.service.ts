import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { EnvironmentVariables } from '../../config/env.validation';
import { SafeUser } from '../users/types/safe-user.type';
import { UsersService } from '../users/users.service';
import { INVALID_CREDENTIALS_MESSAGE } from './constants/auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: SafeUser }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(registerDto.password);

    const user = await this.usersService.createUser({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      passwordHash,
    });

    return { user };
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    const profile = await this.usersService.findById(user.id);

    if (!profile) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return {
      ...tokens,
      user: profile,
    };
  }

  async refreshTokens(user: AuthenticatedUser): Promise<AuthTokens> {
    return this.generateTokens(user.id, user.email);
  }

  async logout(user: AuthenticatedUser): Promise<void> {
    await this.usersService.updateRefreshTokenHash(user.id, null);
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
          infer: true,
        }),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
          infer: true,
        }),
      }),
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return { accessToken, refreshToken };
  }
}
