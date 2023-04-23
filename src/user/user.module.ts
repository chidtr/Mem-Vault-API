import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MeiliSearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [MeiliSearchModule],
  controllers: [UserController],
})
export class UserModule {}
