import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_STRATEGY } from '../constants/auth.constants';
import { EnvironmentVariables } from '../../../config/env.validation';
import { JwtPayload } from '../interfaces/authenticated-user.interface';
import { UsersService } from '../../users/users.service';

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken?: string;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    configService: ConfigService<EnvironmentVariables, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET', { infer: true }),
      passReqToCallback: true,
    });
  }

  async validate(request: RefreshTokenRequest, payload: JwtPayload) {
    const refreshToken = request.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      id: user.id,
      email: user.email,
      refreshToken,
    };
  }
}
