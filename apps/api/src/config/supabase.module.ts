import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Making SupabaseModule global means any module can inject the client
// without importing SupabaseModule explicitly — important for a shared resource.
@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_URL');
        const key = config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
        // We use the service-role key in the API so we can bypass RLS when needed
        // (e.g. admin operations). The frontend uses the anon key with RLS enforced.
        return createClient(url, key, {
          auth: { persistSession: false },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
