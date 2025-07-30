import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { RoomSocketEvents } from '../../types/rooms';

const PATTERNS_TO_SUBSCRIBE = [
  'room-join',
  'room-leave',
  'room-set-ready',
  'room-submit-answers',
];

@WebSocketGateway({ cors: true })
export class RoomsWebsocketGateway implements OnModuleInit {
  constructor(
    @Inject('ROOMS_GATEWAY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(RoomSocketEvents.ROOM_JOIN)
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = data;

    client.join(roomId);

    const { participants, targetUsers, testId, results } = await firstValueFrom(
      this.kafkaClient.send('room-join', { roomId, userId }),
    );

    client.emit(RoomSocketEvents.ROOM_DATA, {
      participants,
      users: targetUsers,
      testId,
      results,
    });
  }

  @SubscribeMessage(RoomSocketEvents.ROOM_LEAVE)
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: number },
  ) {
    const { roomId, userId } = data;

    const { targetUsers } = await firstValueFrom(
      this.kafkaClient.send('room-leave', { roomId, userId }),
    );

    this.server.to(roomId).emit(RoomSocketEvents.ROOM_USERS, targetUsers);
  }

  @SubscribeMessage(RoomSocketEvents.SET_READY)
  async handleSetReady(
    @MessageBody() data: { roomId: string; userId: number },
  ) {
    const { roomId, userId } = data;

    const { targetUsers, isAllParticipantsReady } = await firstValueFrom(
      this.kafkaClient.send('room-set-ready', { roomId, userId }),
    );

    this.server.to(roomId).emit(RoomSocketEvents.ROOM_USERS, targetUsers);

    if (isAllParticipantsReady) {
      this.server.to(roomId).emit(RoomSocketEvents.START_QUIZ);
    }
  }

  @SubscribeMessage(RoomSocketEvents.SUBMIT_ANSWERS)
  async handleSubmitAnswers(
    @MessageBody()
    data: {
      roomId: string;
      userId: number;
      answers: { questionId: string; answer: string[] }[];
    },
  ) {
    const { answers, userId, roomId } = data;

    const { updatedResults } = await firstValueFrom(
      this.kafkaClient.send('room-submit-answers', { answers, userId, roomId }),
    );

    this.server.to(roomId).emit(RoomSocketEvents.ROOM_RESULTS, updatedResults);
  }
}
