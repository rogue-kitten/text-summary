import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { TokenTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { GenerateSummaryDto } from './dto/GenerateSummary.dto';
import { SummaryGateway } from './summary.gateway';

@Injectable()
export class SummaryService {
  constructor(private readonly summaryGateway: SummaryGateway) {}

  private readonly model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
      organization: process.env.OPENAI_API_ORG,
    },
  });

  private readonly promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'Take the following large block of text eliminated by back quotes and break it into chunks of {chunk_size} sentences each. For each chunk, create a one-line summary. Return the data in JSON format, with each entry containing the `chunk` (the full {chunk_size}-sentence section) and its `summary` (the one-line summary for that section).',
    ],
    ['user', '{text}'],
  ]);

  private readonly responseParser = new JsonOutputParser();

  private readonly textSplitter = new TokenTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 100,
  });

  private readonly summaryGenerationChain = this.promptTemplate
    .pipe(
      this.model.bind({
        response_format: {
          type: 'json_object',
        },
      }),
    )
    .pipe(this.responseParser);

  async splitTextByTokenLength(prompt: string) {
    const token_text = await this.textSplitter.splitText(prompt);

    console.log('length of tokens', token_text.length);

    return token_text;
  }

  async splitTextInGroups({ clientId, text, groupSize }: GenerateSummaryDto) {
    const text_groups = await this.splitTextByTokenLength(text);

    this.generateSummary({ clientId, sentenceGroups: text_groups, groupSize });

    return { success: true };
  }

  async generateSummary({
    clientId,
    sentenceGroups,
    groupSize,
  }: {
    sentenceGroups: string[];
    clientId: string;
    groupSize: number;
  }) {
    try {
      const totalGroups = sentenceGroups.length;

      let counter = 0;
      for await (const sentence of sentenceGroups) {
        const summary = await this.summaryGenerationChain.invoke({
          text: sentence,
          chunk_size: groupSize,
        });

        const { success } = this.summaryGateway.sendMessageToClient({
          channel: 'SUMMARY',
          clientId,
          data: summary,
        });

        if (!success) {
          throw new Error('Client disconnected');
        }

        counter += 1;

        if (totalGroups > 1) {
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
        } else {
          this.summaryGateway.sendMessageToClient({
            channel: 'PROGRESS',
            clientId,
            data: {
              state: 'END',
              progressUpdate: ((counter / totalGroups) * 100).toFixed(0),
            },
          });
        }
      }
    } catch (error) {
      console.log('error while generating summary', error);
    }
  }
}
