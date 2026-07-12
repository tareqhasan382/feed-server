import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import {
  INVALID_CREDENTIALS_MESSAGE,
  JWT_REFRESH_STRATEGY,
} from '../constants/auth.constants';
import { UsersService } from '../../users/users.service';

interface RefreshAuthenticatedUser {
  id: string;
  email: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard(JWT_REFRESH_STRATEGY) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = (await super.canActivate(context)) as boolean;

    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest<{
      user: RefreshAuthenticatedUser;
    }>();
    const { id, refreshToken } = request.user;

    const user = await this.usersService.findByIdWithRefreshToken(id);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isRefreshTokenValid = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return true;
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    if (info) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return user;
  }
}
