import { Module } from '@nestjs/common';
import { QuestionsGatewayController } from './questions.gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  controllers: [QuestionsGatewayController],
  imports: [
    ClientsModule.register([
      {
        name: 'QUESTIONS_GATEWAY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'questions-gateway-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'questions-gateway-group',
          },
        },
      },
    ]),
  ],
})
export class QuestionsGatewayModule {}
