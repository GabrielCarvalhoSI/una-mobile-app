import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './supabase/supabase.module'
import { AuthModule } from './auth/auth.module'
import { ProfilesModule } from './profiles/profiles.module'
import { CollectionPointsModule } from './collection-points/collection-points.module'
import { TransactionsModule } from './transactions/transactions.module'
import { FeedbacksModule } from './feedbacks/feedbacks.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    ProfilesModule,
    CollectionPointsModule,
    TransactionsModule,
    FeedbacksModule,
    AdminModule,
  ],
})
export class AppModule {}
