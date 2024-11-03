import { Body, Controller, Post } from '@nestjs/common';
import { GenerateSummaryDto } from './dto/GenerateSummary.dto';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post('')
  async generateSummaryText(@Body() payload: GenerateSummaryDto) {
    return this.summaryService.splitTextInGroups(payload);
  }
}
