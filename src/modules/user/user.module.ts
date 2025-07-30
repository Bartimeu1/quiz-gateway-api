import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UserGatewayController } from './user.gateway.controller';
import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  controllers: [UserGatewayController],
  imports: [
    ClientsModule.register([
      {
        name: 'USER_GATEWAY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user-gateway-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'user-gateway-group',
          },
        },
      },
    ]),
  ],
})
export class UserGatewayModule {}
