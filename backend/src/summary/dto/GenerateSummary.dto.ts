import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class GenerateSummaryDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsNumber()
  @Min(1)
  groupSize: number;
}
