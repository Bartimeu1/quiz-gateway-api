import { Module } from '@nestjs/common';
import { RoomsGatewayController } from './rooms.gateway.controller';
import { RoomsWebsocketGateway } from './rooms.websocket';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  providers: [RoomsWebsocketGateway],
  controllers: [RoomsGatewayController],
  imports: [
    ClientsModule.register([
      {
        name: 'ROOMS_GATEWAY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'rooms-gateway-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'rooms-gateway-group',
          },
        },
      },
    ]),
  ],
})
export class RoomsGatewayModule {}
