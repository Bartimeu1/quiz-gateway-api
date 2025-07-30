import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserRegisterDto, UserLoginDto } from './dto';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../../guards';

const PATTERNS_TO_SUBSCRIBE = ['auth-register', 'auth-login', 'auth-refresh'];

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthGatewayController implements OnModuleInit {
  constructor(
    @Inject('AUTH_GATEWAY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @Post('/register')
  async register(
    @Body() userRegisterDto: UserRegisterDto,
    @Res() res: Response,
  ) {
    const authData = await firstValueFrom(
      this.kafkaClient.send('auth-register', userRegisterDto),
    );
    res.cookie('refreshToken', authData.refreshToken, REFRESH_TOKEN_OPTIONS);

    return res.send({ accessToken: authData.accessToken, user: authData.user });
  }

  @Post('/login')
  async login(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    const authData = await firstValueFrom(
      this.kafkaClient.send('auth-login', userLoginDto),
    );
    res.cookie('refreshToken', authData.refreshToken, REFRESH_TOKEN_OPTIONS);

    return res.send({ accessToken: authData.accessToken, user: authData.user });
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      this.kafkaClient.emit('auth-logout', refreshToken);
    }

    res.clearCookie('refreshToken');
    return res.send({ message: 'Logged out successfully' });
  }

  @Post('/refresh')
  @UseGuards(AuthGuard)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({ message: 'Refresh token is missing' });
    }

    const newTokens = await firstValueFrom(
      this.kafkaClient.send('auth-refresh', refreshToken),
    );
    res.cookie('refreshToken', newTokens.refreshToken, REFRESH_TOKEN_OPTIONS);

    return res.send({ accessToken: newTokens.accessToken });
  }
}
