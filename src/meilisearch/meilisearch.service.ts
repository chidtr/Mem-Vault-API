import { Injectable, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MeiliSearch, { TaskStatus } from 'meilisearch';
import { GoogleUserInfo, UserInfo } from '../user/user.type';
import {} from 'lodash';

@Injectable()
export class MeiliSearchService implements OnModuleInit {
  private readonly logger = new Logger(MeiliSearchService.name);
  private clientSearch: MeiliSearch;

  constructor(private readonly configService: ConfigService) {
    this.clientSearch = new MeiliSearch({
      host: configService.get('MEILISEARCH_HOST'),
      apiKey: configService.get('MEILISEARCH_API_KEY'),
    });
  }
  async onModuleInit() {
    try {
      await this.clientSearch.getIndex('user');
    } catch (error) {
      await this.clientSearch.createIndex('user');
    }
  }

  public async createUserIndex(
    spaceIndexName: string,
    sortableAttributes: string[] = ['name', 'createdAt'],
  ) {
    const task = await this.clientSearch.createIndex(spaceIndexName);
    await this.waitUtilTaskFinish(task.taskUid);
    await this.clientSearch.index(spaceIndexName).updateSettings({
      searchableAttributes: ['*'],
      sortableAttributes,
    });
  }

  public async createDocumentation(index: string, data: any) {
    await this.clientSearch.index(index).addDocuments([data]);
  }

  public async getAllDocumentations(index: string) {
    return await this.clientSearch.index(index).getDocuments({});
  }

  public async createUserKey(userId: string, indexes: string[]) {
    return await this.clientSearch.createKey({
      description: userId,
      actions: ['documents.*', 'search', 'indexes.get'],
      indexes: indexes,
      expiresAt: null,
    });
  }

  public async getUser(userId): Promise<UserInfo> {
    try {
      return await this.clientSearch.index('user').getDocument(userId);
    } catch (error) {
      return null;
    }
  }

  private async waitUtilTaskFinish(taskId: number) {
    const task = await this.clientSearch.getTask(taskId);
    if (task.status === TaskStatus.TASK_FAILED) {
      throw new Error(task.error.message);
    } else if (task.status === TaskStatus.TASK_SUCCEEDED) {
      return true;
    } else {
      return this.waitUtilTaskFinish(taskId);
    }
  }

  public async createUser(user: GoogleUserInfo, key): Promise<UserInfo> {
    const res = await this.clientSearch.index('user').addDocuments([
      {
        id: user.sub,
        name: user.name,
        email: user.email,
        picture: user.picture,
        key,
      },
    ]);
    await this.waitUtilTaskFinish(res.taskUid);
    return await this.clientSearch.index('user').getDocument(user.sub);
  }

  public async getUserKey(key: string) {
    return this.clientSearch.getKey(key);
  }
  public async updateUserKey(userId: string, key: string, index: string) {
    const currentKey = await this.clientSearch.getKey(key);
    const newKey = await this.createUserKey(userId, [
      index,
      ...currentKey.indexes,
    ]);

    const res = await this.clientSearch
      .index('user')
      .updateDocuments([{ id: userId, key: newKey.key }]);

    await this.waitUtilTaskFinish(res.taskUid);

    await this.clientSearch.deleteKey(currentKey.key);
  }
}
