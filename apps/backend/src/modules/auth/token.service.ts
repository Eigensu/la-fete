import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import process = require('process');

@Injectable()
export class TokenService {
  generateAccessToken(payload: any) {
    const jwtService = new JwtService();
    return jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });
  }

  generateRefreshToken(payload: any) {
    const jwtService = new JwtService();
    return jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
    });
  }

  verifyRefreshToken(token: string) {
    const jwtService = new JwtService();
    return jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
  }

  async hashToken(token: string) {
    return bcrypt.hash(token, 12);
  }

  async compareToken(token: string, hash: string) {
    return bcrypt.compare(token, hash);
  }

  generateRandomTokenHex(bytes = 32) {
    return randomBytes(bytes).toString('hex');
  }
}
