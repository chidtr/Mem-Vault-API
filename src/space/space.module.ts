import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { MeiliSearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [MeiliSearchModule],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
