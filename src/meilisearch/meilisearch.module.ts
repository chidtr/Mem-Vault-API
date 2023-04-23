import { Module } from '@nestjs/common';
import { MeiliSearchService } from './meilisearch.service';

@Module({
  imports: [],
  providers: [MeiliSearchService],
  exports: [MeiliSearchService],
})
export class MeiliSearchModule {}
