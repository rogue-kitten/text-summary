import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SummaryModule],
  controllers: [AppController],
})
export class AppModule {}
