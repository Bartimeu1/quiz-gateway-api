import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class KafkaErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const { response } = error ?? {};

        if (response?.statusCode && response?.message) {
          return throwError(
            () => new HttpException(response, response.statusCode),
          );
        }

        return throwError(
          () => new HttpException('Internal server error', 500),
        );
      }),
    );
  }
}
