import { Controller, Get } from '@nestjs/common';
import { User } from '../common/user-info.decorator';
import { GoogleUserInfo, UserInfo } from '../user/user.type';
import { MeiliSearchService } from '../meilisearch/meilisearch.service';
import { Space } from './space.type';
import { orderBy } from 'lodash';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly meiliSearchService: MeiliSearchService) {}

  @Get()
  async getSpaces(@User() user: GoogleUserInfo) {
    const res = await this.meiliSearchService.getAllDocumentations(
      `${user.sub}_space`,
    );

    return orderBy(res.results, ['name'], ['asc']);
  }
}
