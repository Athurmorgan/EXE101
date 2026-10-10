import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export const REACTION_TYPES = ['like', 'love', 'wow', 'helpful'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export class CreateReactionDto {
  @IsEnum(REACTION_TYPES, { message: `type phai la mot trong: ${REACTION_TYPES.join(', ')}` })
  type!: ReactionType;

  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsOptional()
  @IsUUID()
  postId?: string;
}
