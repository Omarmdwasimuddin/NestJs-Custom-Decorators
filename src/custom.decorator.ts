import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Custom = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {
        // ctx is the request context
        const request = ctx.switchToHttp().getRequest();
        return `Hello ${data || 'World'}! Your path is: ${request.url}`;
    }
)