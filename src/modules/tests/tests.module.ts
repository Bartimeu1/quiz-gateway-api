import { Module } from '@nestjs/common';
import { TestsGatewayController } from './tests.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  controllers: [TestsGatewayController],
  imports: [
    ClientsModule.register([
      {
        name: 'TESTS_GATEWAY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'tests-gateway-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'tests-gateway-group',
          },
        },
      },
    ]),
  ],
})
export class TestsGatewayModule {}
