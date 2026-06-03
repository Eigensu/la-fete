/* global describe, it, expect, jest */
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../common/enums/user-role.enum';

describe('RolesGuard', () => {
  it('allows requests when the role matches', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.ADMIN } }) }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies requests when the role does not match', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.CUSTOMER } }) }),
    } as any;

    expect(guard.canActivate(context)).toBe(false);
  });
});
