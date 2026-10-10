import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  /** Comment vao place hoac post - it nhat mot trong hai. */
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsOptional()
  @IsUUID()
  postId?: string;

  /** Reply comment khac. */
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
