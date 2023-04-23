import { MeiliSearch } from 'meilisearch';

import { ConfigService } from '@nestjs/config';

export function createClient(host: string, apiKey: string) {
  const client = new MeiliSearch({
    host,
    apiKey,
  });
}


export function createUser() {
    
}