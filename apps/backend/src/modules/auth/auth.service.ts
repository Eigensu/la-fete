import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { UserSession } from '../users/entities/user-session.entity';
import { randomBytes } from 'crypto';
import process from 'process';

const FAILED_LOGIN_LIMIT = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly sessionRepository: Repository<UserSession>;
  private readonly tokenService: TokenService;
  private readonly emailService: EmailService;

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserSession)
    sessionRepository: Repository<UserSession>,
    tokenService: TokenService,
    emailService: EmailService,
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, phone, firstName, lastName } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      phone,
      firstName,
      lastName,
    });

    await this.userRepository.save(user);

    const { accessToken, sessionId } = await this.createAuthSession(user);

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<User>).password;
    return { user: userWithoutPassword, accessToken, sessionId };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new ForbiddenException('Account locked due to multiple failed login attempts');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= FAILED_LOGIN_LIMIT) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }
      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // success: reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null as any; // TypeORM nullable
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const { accessToken, sessionId } = await this.createAuthSession(user);

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<User>).password;
    return { user: userWithoutPassword, accessToken, sessionId };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const result = { ...user };
      delete (result as Partial<User>).password;
      return result;
    }

    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createAuthSession(user: User) {
    const accessToken = this.tokenService.generateAccessToken({ sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion });

    const session = await this.sessionRepository.save(
      this.sessionRepository.create({
        user,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
    );

    return { accessToken, sessionId: session.id };
  }

  async storeRefreshToken(sessionId: string, refreshToken: string) {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    session.refreshTokenHash = await this.tokenService.hashToken(refreshToken);
    session.revokedAt = undefined;
    await this.sessionRepository.save(session);
  }

  // Refresh token rotation + reuse detection
  async rotateRefreshToken(oldToken: string) {
    try {
      const payload: any = this.tokenService.verifyRefreshToken(oldToken);
      if (payload.type !== 'refresh') throw new UnauthorizedException();

      const session = await this.sessionRepository.findOne({ where: { id: payload.sid }, relations: ['user'] });
      if (!session || !session.user) throw new UnauthorizedException();

      if (session.revokedAt) {
        await this.revokeAllUserSessions(session.user.id);
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      if (session.expiresAt && session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (!session.refreshTokenHash) {
        await this.revokeAllUserSessions(session.user.id);
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      const isValid = await this.tokenService.compareToken(oldToken, session.refreshTokenHash);
      if (!isValid) {
        await this.revokeAllUserSessions(session.user.id);
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      const accessToken = this.tokenService.generateAccessToken({ sub: session.user.id, email: session.user.email, role: session.user.role, tokenVersion: session.user.tokenVersion });

      return { accessToken, sessionId: session.id, userId: session.user.id };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeAllUserSessions(userId: string) {
    await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: new Date(), refreshTokenHash: undefined })
      .where('"userId" = :userId', { userId })
      .execute();

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await this.userRepository.save(user);
    }
  }

  async logout(userId: string) {
    await this.revokeAllUserSessions(userId);
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return; // do not reveal

    const token = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = await this.tokenService.hashToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.save(user);

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}&id=${user.id}`;
    await this.emailService.sendMail(user.email, 'Password reset', `<p>Reset your password: <a href="${resetUrl}">Reset</a></p>`);
  }

  async resetPassword(userId: string, token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) throw new BadRequestException('Invalid token');
    if (user.passwordResetExpiresAt < new Date()) throw new BadRequestException('Token expired');

    const valid = await this.tokenService.compareToken(token, user.passwordResetTokenHash);
    if (!valid) throw new BadRequestException('Invalid token');

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    // revoke sessions
    await this.sessionRepository.update({ user: { id: user.id } }, { revokedAt: new Date() });
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await this.userRepository.save(user);
  }

  async sendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return;
    const token = randomBytes(32).toString('hex');
    user.emailVerificationTokenHash = await this.tokenService.hashToken(token);
    user.emailVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.save(user);

    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}&id=${user.id}`;
    await this.emailService.sendMail(user.email, 'Verify your email', `<p>Verify your email: <a href="${verifyUrl}">Verify</a></p>`);
  }

  async verifyEmail(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.emailVerificationTokenHash || !user.emailVerificationExpiresAt) throw new BadRequestException('Invalid token');
    if (user.emailVerificationExpiresAt < new Date()) throw new BadRequestException('Token expired');

    const valid = await this.tokenService.compareToken(token, user.emailVerificationTokenHash);
    if (!valid) throw new BadRequestException('Invalid token');

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await this.userRepository.save(user);
  }

  // Handle google login/linking
  async handleGoogleLogin({ googleId, email, firstName, lastName }: { googleId: string; email: string; firstName?: string; lastName?: string; }) {
    try {
      console.log('handleGoogleLogin started for googleId:', googleId, 'email:', email);
      // 1. Try find by googleId
      let user = await this.userRepository.findOne({ where: { googleId } });
      if (user) {
        console.log('handleGoogleLogin found by googleId');
        return user;
      }

      // 2. If email exists, link account
      if (email) {
        user = await this.userRepository.findOne({ where: { email } });
        if (user) {
          console.log('handleGoogleLogin found by email, linking account');
          user.googleId = googleId;
          user.emailVerified = true;
          await this.userRepository.save(user);
          return user;
        }
      }

      console.log('handleGoogleLogin creating new user');
      // 3. Create new user
      const newUser = this.userRepository.create({
        email,
        googleId,
        firstName,
        lastName,
        phone: '',
        password: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
        emailVerified: true,
      });
      await this.userRepository.save(newUser);
      console.log('handleGoogleLogin new user saved:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('handleGoogleLogin error:', error);
      throw error;
    }
  }

  async createTokensForUser(user: User) {
    return this.createAuthSession(user);
  }
}
