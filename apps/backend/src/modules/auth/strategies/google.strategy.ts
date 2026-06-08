import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import process from 'process';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
    this.authService = authService;
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      console.log('GoogleStrategy validate started');
      const { id, emails, name } = profile;
      const email = emails && emails[0] && emails[0].value;
      const firstName = name?.givenName || undefined;
      const lastName = name?.familyName || undefined;

      console.log('GoogleStrategy calling handleGoogleLogin for:', email);
      // Delegate to AuthService to handle linking/creation
      const user = await this.authService.handleGoogleLogin({
        googleId: id,
        email,
        firstName,
        lastName,
      });

      console.log('GoogleStrategy user returned:', user?.id);
      return user;
    } catch (error) {
      console.error('GoogleStrategy validate error:', error);
      throw error;
    }
  }
}
