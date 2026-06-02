import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../integrations/supabase/supabase.service';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const result = await this.supabaseService.getAuthClient().auth.getUser(token);
    if (result.error || !result.data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = {
      id: result.data.user.id,
      email: result.data.user.email,
      role: (result.data.user.user_metadata?.role as string | undefined) ?? 'customer',
    };

    return true;
  }
}
