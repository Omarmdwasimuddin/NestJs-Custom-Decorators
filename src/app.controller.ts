import { Controller, Get } from '@nestjs/common';
import { CustomDecorator } from './custom.decorator';

@Controller('')
export class AppController {
 

  @Get()
  getHello(@CustomDecorator('Wasim') greeting:string) {
    return greeting;
  }
}