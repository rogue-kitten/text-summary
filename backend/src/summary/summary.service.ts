import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGroq } from '@langchain/groq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { splitBySentences } from 'src/utils/helper';
import { GenerateSummaryDto } from './dto/GenerateSummary.dto';
import { SummaryGateway } from './summary.gateway';

@Injectable()
export class SummaryService {
  constructor(private readonly summaryGateway: SummaryGateway) {}

  private readonly model = new ChatGroq({
    model: 'llama-3.2-3b-preview',
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
  });

  private readonly system_message =
    'Generate a one line summary for the following text';

  private readonly promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', this.system_message],
    ['user', '{text}'],
  ]);

  private readonly responseParser = new StringOutputParser();

  private readonly summaryGenerationChain = this.promptTemplate
    .pipe(this.model)
    .pipe(this.responseParser);

  splitTextInGroups({ clientId, text, groupSize }: GenerateSummaryDto) {
    if (!this.summaryGateway.checkIfValidClient(clientId)) {
      throw new HttpException(
        'Invalid Socket ClientId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sentenceGroups = splitBySentences({ text, size: groupSize });

    this.generateSummary({ clientId, sentenceGroups });

    return { success: true };
  }

  async generateSummary({
    clientId,
    sentenceGroups,
  }: {
    sentenceGroups: string[];
    clientId: string;
  }) {
    try {
      const totalGroups = sentenceGroups.length;

      let counter = 0;
      for await (const sentence of sentenceGroups) {
        const summary = await this.summaryGenerationChain.invoke({
          text: sentence,
        });

        const { success } = this.summaryGateway.sendMessageToClient({
          channel: 'SUMMARY',
          clientId,
          data: {
            sentence,
            summary,
          },
        });

        if (!success) {
          throw new Error('Client disconnected');
        }

        counter += 1;

        this.summaryGateway.sendMessageToClient({
          channel: 'PROGRESS',
          clientId,
          data: {
            state:
              counter === 1
                ? 'START'
                : counter === totalGroups
                  ? 'END'
                  : 'PROGRESS',
            progressUpdate: ((counter / totalGroups) * 100).toFixed(0),
          },
        });
      }
    } catch (error) {
      console.log('error while generating summary', error);
    }
  }
}
