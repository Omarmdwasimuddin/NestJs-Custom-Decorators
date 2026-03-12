## Custom Decorator

##### Create- src/custom.decorator.ts

```bash
# custom.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Custom = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {
        // ctx is the request context
        const request = ctx.switchToHttp().getRequest();
        return `Hello ${data || 'World'}! Your path is: ${request.url}`;
    }
)
```

```bash
# app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { CustomDecorator } from './custom.decorator';

@Controller('')
export class AppController {
 

  @Get()
  getHello(@CustomDecorator('Wasim') greeting:string) {
    return greeting;
  }
}
```

![](/public/Img/output-view.png)