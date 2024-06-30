import { Response, Request } from 'express';
import { IUser } from './models/User';

export interface BaseResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export type ApiResponse<T> = Response<BaseResponse<T>>;

export interface ApiRequest<ReqBody = any> extends Request {
  body: ReqBody
}

export interface AuthenticatedRequest<ReqBody = any> extends Request {
  body: ReqBody;
  user?: IUser;
}

