import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserRoles } from '../types/user';

interface AuthenticatedRequest extends Request {
  user: { role: UserRoles };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user?.role === UserRoles.ADMIN;
  }
}
