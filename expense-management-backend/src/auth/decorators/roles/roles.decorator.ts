import { SetMetadata } from '@nestjs/common';

// Is key mein required roles store honge
export const ROLES_KEY = 'roles';

// Controller ya endpoint ke liye allowed roles define karo
export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

