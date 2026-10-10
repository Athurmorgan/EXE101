import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ModerationDecisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateModerationActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}
