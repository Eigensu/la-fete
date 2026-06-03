import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerifyDto } from './dto/send-verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token.service';
import process from 'process';

@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;
  private readonly tokenService: TokenService;

  constructor(authService: AuthService, tokenService: TokenService) {
    this.authService = authService;
    this.tokenService = tokenService;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: (result as any).user.id,
      sid: (result as any).sessionId,
      type: 'refresh',
    });
    await this.authService.storeRefreshToken((result as any).sessionId, refreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    delete (result as any).sessionId;
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: (result as any).user.id,
      sid: (result as any).sessionId,
      type: 'refresh',
    });
    await this.authService.storeRefreshToken((result as any).sessionId, refreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    delete (result as any).sessionId;
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user: any = (req as any).user;
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token', { path: '/auth/refresh', domain: process.env.COOKIE_DOMAIN || undefined });
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req as any).cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const result = await this.authService.rotateRefreshToken(token);
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: result.userId,
      sid: result.sessionId,
      type: 'refresh',
    });
    await this.authService.storeRefreshToken(result.sessionId, refreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: result.accessToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return { success: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.userId, body.token, body.newPassword);
    return { success: true };
  }

  @Post('send-verification-email')
  async sendVerification(@Body() body: SendVerifyDto) {
    await this.authService.sendVerificationEmail(body.email);
    return { success: true };
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    await this.authService.verifyEmail(body.userId, body.token);
    return { success: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user: any = req.user;
    const tokens = await this.authService.createTokensForUser(user);
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
      sid: tokens.sessionId,
      type: 'refresh',
    });
    await this.authService.storeRefreshToken(tokens.sessionId, refreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback`);
  }
}
