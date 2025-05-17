import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class Beds24Guard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.setHeader('WWW-Authenticate', 'Bearer');
      throw new UnauthorizedException();
    }

    const token = authHeader.split(' ')[1];
    const expectedToken = this.configService.getOrThrow<string>(
      'WEBHOOK_BEDS24_TOKEN',
    );

    if (token !== expectedToken) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
