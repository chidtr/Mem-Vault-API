import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { GoogleUserInfo, UserInfo } from '../user/user.type';
const client = new OAuth2Client();

async function verifyToken(token) {
  client.setCredentials({ access_token: token });
  const userinfo = await client.request({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });
  return userinfo.data as GoogleUserInfo;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization.replace('Bearer', '');
    if (!token) {
      throw new UnauthorizedException();
    }

    const userInfo = await verifyToken(token);
    (req as any).user = { id: userInfo.sub, ...userInfo };

    next();
  }
}
