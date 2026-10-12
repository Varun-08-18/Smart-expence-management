import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Request ke Authorization header se token nikalo
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Expired token ko reject karo
      ignoreExpiration: false,

      // Wahi secret use karo jo token generate karne mein use hua
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Token valid hone par decoded user data request mein milega
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}