import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT valid hone par hi protected route access hoga
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}