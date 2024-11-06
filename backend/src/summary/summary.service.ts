import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { splitArrayIntoChunks, splitBySentences } from 'src/utils/helper';
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
      'Take the following array, which contains exactly {chunks} strings. For each string, create a one-line summary. Return only the summaries in a JSON array format, with each summary matching the corresponding position in the input array. The output array must have exactly {chunks} summaries and no more. Summarize each string only once, without adding or omitting any entries, regardless of input array size. Ensure that each summary corresponds exactly to its input, and no extra summaries are included. Do not omit any input strings, no matter how small they are in length or nonsensical they are',
    ],
    ['user', '{text}'],
  ]);

  private readonly responseParser = new JsonOutputParser();

  // private readonly textSplitter = new TokenTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 0,
  // });

  private readonly summaryGenerationChain = this.promptTemplate
    .pipe(
      this.model.bind({
        response_format: {
          type: 'json_object',
        },
      }),
    )
    .pipe(this.responseParser);

  // async splitTextByTokenLength(prompt: string) {
  //   const token_text = await this.textSplitter.splitText(prompt);

  //   console.log('length of tokens', token_text.length);

  //   return token_text;
  // }

  async splitTextInGroups({ clientId, text, groupSize }: GenerateSummaryDto) {
    // const text_groups = await this.splitTextByTokenLength(text);

    const text_array = splitBySentences({ text, size: groupSize });

    const grouped_array = splitArrayIntoChunks({
      arr: text_array,
      chunkSize: 12,
    });

    this.generateSummary({ clientId, sentenceGroups: grouped_array });
  }

  async generateSummary({
    clientId,
    sentenceGroups,
  }: {
    sentenceGroups: string[][];
    clientId: string;
  }) {
    try {
      const totalGroups = sentenceGroups.length;

      let counter = 0;
      for await (const sentence of sentenceGroups) {
        const summary = await this.summaryGenerationChain.invoke({
          text: JSON.stringify(sentence),
          chunks: sentence.length,
        });

        const summaryArray = summary[Object.keys(summary)[0]];

        const combined: any = sentence.map((item, index) => ({
          chunk: item,
          summary: summaryArray?.[index] ?? '',
        }));

        const { success } = this.summaryGateway.sendMessageToClient({
          channel: 'SUMMARY',
          clientId,
          data: {
            chunks: combined,
          },
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
