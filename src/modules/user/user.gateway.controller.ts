import {
  Controller,
  UseGuards,
  Inject,
  Query,
  OnModuleInit,
  Get,
  Body,
  Post,
  Param,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard, AdminGuard } from '../../guards';
import { ChangeAvatarDto, ChangePasswordDto, UpdateRoleDto } from './dto';

const PATTERNS_TO_SUBSCRIBE = [
  'get-all-users',
  'get-leaders',
  'change-avatar',
  'update-role',
];

@Controller('/users')
@UseGuards(AuthGuard)
export class UserGatewayController implements OnModuleInit {
  constructor(
    @Inject('USER_GATEWAY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @Get()
  getAllUsers(@Query('query') query?: string) {
    return this.kafkaClient.send('get-all-users', { query: query || '' });
  }

  @Get('/leaders')
  getLeaders() {
    return this.kafkaClient.send('get-leaders', {});
  }

  @Post('/change-avatar')
  changeAvatar(@Body() changeAvatarDto: ChangeAvatarDto) {
    return this.kafkaClient.send('change-avatar', changeAvatarDto);
  }

  @Post('/change-password')
  @HttpCode(204)
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.kafkaClient.emit('change-password', changePasswordDto);
  }

  @Patch('/update-role/:userId')
  @UseGuards(AdminGuard)
  updateRole(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.kafkaClient.send('update-role', { userId, ...updateRoleDto });
  }
}
