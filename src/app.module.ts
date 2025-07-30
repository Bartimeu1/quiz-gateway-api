import { Module } from '@nestjs/common';

import { UserGatewayModule } from './modules/user/user.module';
import { AuthGatewayModule } from './modules/auth/auth.module';
import { QuestionsGatewayModule } from './modules/questions/questions.module';
import { TestsGatewayModule } from './modules/tests/tests.module';
import { RoomsGatewayModule } from './modules/rooms/rooms.module';

@Module({
  imports: [
    UserGatewayModule,
    AuthGatewayModule,
    QuestionsGatewayModule,
    TestsGatewayModule,
    RoomsGatewayModule,
  ],
})
export class AppModule {}
