import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY} from '../../decorators/roles/roles.decorator.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Endpoint ke liye required roles nikalo
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Roles define nahi hain toh role restriction nahi hai
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // JWT Guard se authenticated user request mein milta hai
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;

    // Missing ya unauthorized role ko reject karo
    if (!user || !requiredRoles.includes(user.role ?? '')) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
