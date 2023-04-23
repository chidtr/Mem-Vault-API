import { Controller, Get } from '@nestjs/common';
import { GoogleUserInfo, UserInfo } from './user.type';
import { User } from '../common/user-info.decorator';
import { MeiliSearchService } from '../meilisearch/meilisearch.service';
import { ulid } from 'ulid';

@Controller('user')
export class UserController {
  constructor(private readonly meiliSearchService: MeiliSearchService) {}

  @Get('/info')
  async getUserInfo(@User() user: GoogleUserInfo): Promise<UserInfo> {
    const currentUser = await this.meiliSearchService.getUser(user.sub);
    if (!currentUser) {
      // create space
      const defaultSpace = {
        id: ulid(),
        name: 'Personal',
        createdAt: Date.now(),
      };
      const spaceIndexName = `${user.sub}_space`;
      await this.meiliSearchService.createUserIndex(`${spaceIndexName}`);
      await this.meiliSearchService.createUserIndex(`${defaultSpace.id}`);

      await this.meiliSearchService.createDocumentation(
        spaceIndexName,
        defaultSpace,
      );

      const keyData = await this.meiliSearchService.createUserKey(user.sub, [
        spaceIndexName,
        defaultSpace.id,
      ]);
      return await this.meiliSearchService.createUser(user, keyData.key);
    }

    const res = await this.meiliSearchService.getUserKey(currentUser.key);

    return currentUser;
  }
}
