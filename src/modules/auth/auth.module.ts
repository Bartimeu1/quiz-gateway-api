import { Module } from '@nestjs/common';

import { AuthGatewayController } from './auth.gateway.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  controllers: [AuthGatewayController],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'AUTH_GATEWAY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-gateway-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'auth-gateway-group',
          },
        },
      },
    ]),
  ],
})
export class AuthGatewayModule {}
