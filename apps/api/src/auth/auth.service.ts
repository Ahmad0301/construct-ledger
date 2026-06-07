import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../common/supabase.module';

@Injectable()
export class AuthService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  /**
   * Verify a Supabase JWT and return the user profile.
   * The frontend sends the Supabase access token; we validate it here
   * and return user data to attach to the request context.
   */
  async validateSupabaseToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Invalid token');

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { user: data.user, profile };
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw new UnauthorizedException('Profile not found');
    return data;
  }
}
