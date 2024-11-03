import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { SummaryGateway } from './summary.gateway';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService, SummaryGateway]
})
export class SummaryModule {}
