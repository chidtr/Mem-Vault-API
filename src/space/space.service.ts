import { Injectable } from '@nestjs/common';

@Injectable()
export class SpaceService {
  health(): string {
    return 'Mem Vault API';
  }
}
