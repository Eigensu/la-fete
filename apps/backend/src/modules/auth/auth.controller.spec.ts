/* global describe, beforeEach, it, expect, jest */
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import process from 'process';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let tokenService: any;

  const res = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  });

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      rotateRefreshToken: jest.fn(),
      storeRefreshToken: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      sendVerificationEmail: jest.fn(),
      verifyEmail: jest.fn(),
      createTokensForUser: jest.fn(),
    };

    tokenService = {
      generateRefreshToken: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
    process.env.COOKIE_SECURE = 'false';
    process.env.FRONTEND_URL = 'http://frontend.test';
    process.env.COOKIE_DOMAIN = '';
  });

  it('sets refresh cookie on register without exposing refresh token', async () => {
    authService.register.mockResolvedValue({ user: { id: 'user-1' }, accessToken: 'access', sessionId: 'session-1' });
    tokenService.generateRefreshToken.mockReturnValue('refresh');
    const response = res();

    const result = await controller.register(
      { email: 'u@test.com', password: 'Password123!', phone: '123', firstName: 'A', lastName: 'B' } as any,
      response as any,
    );

    expect(authService.storeRefreshToken).toHaveBeenCalledWith('session-1', 'refresh');
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.objectContaining({ httpOnly: true }));
    expect((result as any).refreshToken).toBeUndefined();
  });

  it('sets refresh cookie on login without exposing refresh token', async () => {
    authService.login.mockResolvedValue({ user: { id: 'user-1' }, accessToken: 'access', sessionId: 'session-2' });
    tokenService.generateRefreshToken.mockReturnValue('refresh-2');
    const response = res();

    const result = await controller.login({ email: 'u@test.com', password: 'Password123!' } as any, response as any);

    expect(authService.storeRefreshToken).toHaveBeenCalledWith('session-2', 'refresh-2');
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-2', expect.any(Object));
    expect((result as any).refreshToken).toBeUndefined();
  });

  it('rotates refresh cookie and returns access token only', async () => {
    authService.rotateRefreshToken.mockResolvedValue({ accessToken: 'new-access', sessionId: 'session-3', userId: 'user-1' });
    tokenService.generateRefreshToken.mockReturnValue('refresh-3');
    const response = res();

    const result = await controller.refresh({ cookies: { refresh_token: 'old' } } as any, response as any);

    expect(authService.storeRefreshToken).toHaveBeenCalledWith('session-3', 'refresh-3');
    expect(result).toEqual({ accessToken: 'new-access' });
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-3', expect.any(Object));
  });

  it('redirects google callback without access token query params', async () => {
    authService.createTokensForUser.mockResolvedValue({ accessToken: 'access', sessionId: 'session-4' });
    tokenService.generateRefreshToken.mockReturnValue('refresh-4');
    const response = res();

    await controller.googleAuthRedirect({ user: { id: 'user-1' } } as any, response as any);

    expect(response.redirect).toHaveBeenCalledWith('http://frontend.test/auth/google/callback');
    expect(String(response.redirect.mock.calls[0][0])).not.toContain('accessToken=');
  });
});
