import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AuthenticatedUser {
  readonly id: string;
  readonly role: string;
  readonly username: string;
}

interface AccessTokenPayload {
  readonly sub: string;
  readonly role: string;
  readonly username: string;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  accessTokenTtlSeconds(): number {
    return this.config.getOrThrow<number>('app.jwtAccessTokenTtlSeconds');
  }

  async signAccessToken(user: AuthenticatedUser): Promise<string> {
    return this.jwtService.signAsync(
      {
        role: user.role,
        username: user.username,
      },
      {
        expiresIn: this.accessTokenTtlSeconds(),
        secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
        subject: user.id,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
        },
      );

      return {
        id: payload.sub,
        role: payload.role,
        username: payload.username,
      };
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }
}
