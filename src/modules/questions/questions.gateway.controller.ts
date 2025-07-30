import {
  Controller,
  Inject,
  UseGuards,
  Body,
  Post,
  Get,
  Delete,
  Param,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard, AdminGuard } from '../../guards';

import { CreateQuestionDto } from './dto/create-question';

const PATTERNS_TO_SUBSCRIBE = [
  'create-question',
  'get-questions',
  'get-public-questions',
];

@Controller('/questions')
@UseGuards(AuthGuard)
export class QuestionsGatewayController implements OnModuleInit {
  constructor(
    @Inject('QUESTIONS_GATEWAY_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  @Post('/create-question')
  @UseGuards(AdminGuard)
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.kafkaClient.send('create-question', createQuestionDto);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  getTestQuestions(@Param('id') id: number) {
    return this.kafkaClient.send('get-questions', id);
  }

  @Get('/public/:id')
  getPublicQuestions(@Param('id') id: number) {
    return this.kafkaClient.send('get-public-questions', id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteQuestion(@Param('id') id: number) {
    this.kafkaClient.emit('delete-question', id);
  }
}
