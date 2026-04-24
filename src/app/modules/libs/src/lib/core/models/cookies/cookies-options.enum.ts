import { SameSite } from '../../types/cookies.types';

export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  sameSite?: SameSite;
  secure?: boolean;
}
