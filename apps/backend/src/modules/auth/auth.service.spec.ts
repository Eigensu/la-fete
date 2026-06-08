/* eslint-env jest */
/* global describe, beforeEach, it, expect, jest */
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { UserRole } from '../../common/enums/user-role.enum';
import process from 'process';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let sessionRepository: any;
  let tokenService: jest.Mocked<TokenService>;
  let emailService: jest.Mocked<EmailService>;

  const baseUser = {
    id: 'user-1',
    email: 'user@example.com',
    password: 'hashed-password',
    phone: '1234567890',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CUSTOMER,
    emailVerified: false,
    tokenVersion: 0,
    failedLoginAttempts: 0,
  } as User;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.FRONTEND_URL = 'http://frontend.test';

    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    sessionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashToken: jest.fn(),
      compareToken: jest.fn(),
      generateRandomTokenHex: jest.fn(),
    } as any;

    emailService = {
      sendMail: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(UserSession), useValue: sessionRepository },
        { provide: TokenService, useValue: tokenService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers a user and returns no refresh token', async () => {
    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockReturnValue(baseUser);
    userRepository.save.mockImplementation(async (entity: any) => entity);
    sessionRepository.create.mockReturnValue({ user: baseUser, expiresAt: new Date() });
    sessionRepository.save.mockImplementation(async (entity: any) => ({ ...entity, id: 'session-1' }));
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    tokenService.hashToken.mockResolvedValue('hashed-refresh-token');

    const result = await service.register({
      email: baseUser.email,
      password: 'Password123!',
      phone: baseUser.phone,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
    });

    expect(result.accessToken).toBe('access-token');
    expect((result as any).refreshToken).toBeUndefined();
    expect((result as any).sessionId).toBe('session-1');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('logs in a user and returns no refresh token', async () => {
    userRepository.findOne.mockResolvedValue(baseUser);
    userRepository.save.mockImplementation(async (entity: any) => entity);
    sessionRepository.create.mockReturnValue({ user: baseUser, expiresAt: new Date() });
    sessionRepository.save.mockImplementation(async (entity: any) => ({ ...entity, id: 'session-2' }));
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    tokenService.hashToken.mockResolvedValue('hashed-refresh-token');
    tokenService.compareToken.mockResolvedValue(true);
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ email: baseUser.email, password: 'Password123!' });

    expect(result.accessToken).toBe('access-token');
    expect((result as any).refreshToken).toBeUndefined();
    expect((result as any).sessionId).toBe('session-2');
  });

  it('rotates a refresh token', async () => {
    const sessionUser = { ...baseUser };
    sessionRepository.findOne.mockResolvedValue({
      id: 'session-3',
      user: sessionUser,
      refreshTokenHash: 'stored-hash',
      revokedAt: undefined,
      expiresAt: new Date(Date.now() + 1000),
    });
    tokenService.verifyRefreshToken.mockReturnValue({ type: 'refresh', sid: 'session-3' });
    tokenService.compareToken.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('new-access-token');

    const result = await service.rotateRefreshToken('old-token');

    expect(result).toEqual({ accessToken: 'new-access-token', sessionId: 'session-3', userId: 'user-1' });
  });

  it('detects refresh token reuse', async () => {
    const revokeSpy = jest.spyOn(service, 'revokeAllUserSessions').mockResolvedValue(undefined);
    sessionRepository.findOne.mockResolvedValue({
      id: 'session-4',
      user: baseUser,
      refreshTokenHash: 'stored-hash',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000),
    });
    tokenService.verifyRefreshToken.mockReturnValue({ type: 'refresh', sid: 'session-4' });

    await expect(service.rotateRefreshToken('old-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(revokeSpy).toHaveBeenCalledWith('user-1');
  });

  it('logs out by revoking all sessions', async () => {
    const revokeSpy = jest.spyOn(service, 'revokeAllUserSessions').mockResolvedValue(undefined);

    await service.logout('user-1');

    expect(revokeSpy).toHaveBeenCalledWith('user-1');
  });

  it('creates forgot password token and sends email', async () => {
    userRepository.findOne.mockResolvedValue(baseUser);
    tokenService.hashToken.mockResolvedValue('hashed-reset');

    await service.forgotPassword(baseUser.email);

    expect(emailService.sendMail).toHaveBeenCalledWith(
      baseUser.email,
      'Password reset',
      expect.stringContaining('/auth/reset-password?token='),
    );
  });

  it('resets password', async () => {
    userRepository.findOne.mockResolvedValue({
      ...baseUser,
      passwordResetTokenHash: 'reset-hash',
      passwordResetExpiresAt: new Date(Date.now() + 1000),
    } as User);
    tokenService.compareToken.mockResolvedValue(true);
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('new-hash');

    await service.resetPassword('user-1', 'reset-token', 'NewPassword123!');

    expect(userRepository.save).toHaveBeenCalled();
  });

  it('verifies email', async () => {
    userRepository.findOne.mockResolvedValue({
      ...baseUser,
      emailVerificationTokenHash: 'verify-hash',
      emailVerificationExpiresAt: new Date(Date.now() + 1000),
    } as User);
    tokenService.compareToken.mockResolvedValue(true);

    await service.verifyEmail('user-1', 'verify-token');

    expect(userRepository.save).toHaveBeenCalled();
  });
});
