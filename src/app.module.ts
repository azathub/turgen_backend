import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { NewsModule } from './modules/news/news.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SocialModule } from './modules/social/social.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    NewsModule,
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
