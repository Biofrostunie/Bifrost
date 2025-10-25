import { ApiProperty } from '@nestjs/swagger';

export class GetRatesResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success!: boolean;

  @ApiProperty({
    description: 'Array of investment rates',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        rateType: {
          type: 'string',
          enum: ['selic', 'ipca', 'poupanca', 'cdi'],
          description: 'Type of investment rate'
        },
        value: {
          type: 'number',
          description: 'Current rate value'
        },
        date: {
          type: 'string',
          format: 'date',
          description: 'Date when the rate was last updated'
        },
        change: {
          type: 'number',
          description: 'Delta versus previous record (daily or previous datapoint)'
        }
      }
    }
  })
  data!: Array<{
    rateType: string;
    value: number;
    date: string;
    change: number;
  }>;
}
