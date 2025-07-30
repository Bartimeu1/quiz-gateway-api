import {
  Controller,
  OnModuleInit,
  Inject,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { CreateRoomDto } from './dto';

import { AuthGuard, AdminGuard } from '../../guards';

const PATTERNS_TO_SUBSCRIBE = ['create-room', 'room-join'];

@Controller('/rooms')
@UseGuards(AuthGuard)
export class RoomsGatewayController implements OnModuleInit {
  constructor(
    @Inject('ROOMS_GATEWAY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @Post('/create-room')
  @UseGuards(AdminGuard)
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.kafkaClient.send('create-room', createRoomDto);
  }
}
