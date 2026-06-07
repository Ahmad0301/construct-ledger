import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { MilestonesModule } from './milestones/milestones.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SupabaseModule } from './common/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    AuthModule,
    ProjectsModule,
    MilestonesModule,
    InvoicesModule,
  ],
})
export class AppModule {}
