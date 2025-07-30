import {
  Controller,
  OnModuleInit,
  Inject,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateTestDto } from './dto';
import { AuthGuard, AdminGuard } from '../../guards';

const PATTERNS_TO_SUBSCRIBE = [
  'get-all-tests',
  'get-test-by-id',
  'create-test',
];

@Controller('/tests')
@UseGuards(AuthGuard)
export class TestsGatewayController implements OnModuleInit {
  constructor(
    @Inject('TESTS_GATEWAY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @Get()
  @UseGuards(AdminGuard)
  getAllTests() {
    return this.kafkaClient.send('get-all-tests', {});
  }

  @Get(':id')
  getTest(@Param('id') id: number) {
    return this.kafkaClient.send('get-test-by-id', id);
  }

  @Delete(':id')
  deleteQuestion(@Param('id') id: number) {
    this.kafkaClient.emit('delete-test', id);
  }

  @Post('/create-test')
  @UseGuards(AdminGuard)
  createTest(@Body() createTestDto: CreateTestDto) {
    return this.kafkaClient.send('create-test', createTestDto);
  }
}
