import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { CommunityModule } from '../community/community.module';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [CommunityModule, PlacesModule],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
