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

## Custom Decorator for Guard

```bash
# create guard
$ nest g guard guards/roles
```

#### Add file- guards/roles/roles.decorator.ts & guards/roles/roles.enums.ts

```bash
# roles.decorator.ts
// Custom decorator
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

```

```bash
# roles.enums.ts
export enum Role {
    User = 'user',
    Admin = 'admin'
}

```

```bash
# roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './roles.enums';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,[
        context.getHandler(),
        context.getClass(),
      ]
    );
    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>}>();
    const userRole = request.headers['x-user-role'] as Role;
    return requiredRoles.includes(userRole);
  }
}

```

```bash
# create controller
$ nest g controller user-roles

```

```bash
# user-roles.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/guards/roles/roles.decorator';
import { Role } from 'src/guards/roles/roles.enums';
import { RolesGuard } from 'src/guards/roles/roles.guard';

@Controller('user-roles')
export class UserRolesController {

    @Get('admin-data')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    getAdminData(){
        return { message: "Only Admins can access this data" };
    }
    @Get('user-data')
    getUserData(){
        return { message: "Any authenticated user can access this data" };
    }

}

```

![](/public/Img/cannotaccessanyone.png)

##### Note: headers e x-user-role dite hobe & value dite hobe ekhane value hishabe admin ache
![](/public/Img/admincanaccess.png)

##### Note: jekono user ei access korte parbe
![](/public/Img/anyonecanaccess.png)




#### ১. Custom Decorator আসলে কী করে

Custom decorator সাধারণত metadata add করে বা request থেকে data extract করে।

মানে:

Decorator → extra information attach করে

তারপর অন্য কিছু (Guard / Interceptor / Pipe / Controller) সেটা ব্যবহার করতে পারে।

---

#### ২. Guard এর সাথে কেন বেশি দেখা যায়

Guard authorization handle করে। তাই অনেক সময় decorator দিয়ে role বা permission metadata set করা হয়।

Example:

```ts
@Roles('admin')
@Get('users')
getUsers() {}
```

এখানে

`@Roles()` → metadata set করছে
`RolesGuard` → metadata পড়ে check করছে

Flow:

```
Roles Decorator
     ↓
Metadata add
     ↓
RolesGuard read metadata
     ↓
Access allow / deny
```

---

#### ৩. কিন্তু Custom Decorator আরও অনেক কাজে লাগে

#### ১️⃣ Request থেকে data নেওয়া

Example:

```ts
@CurrentUser()
```

Decorator:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Controller:

```ts
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

এখানে Guard লাগেনি।

---

#### ২️⃣ Route public করা

Example:

```ts
@Public()
@Get('login')
login() {}
```

Decorator:

```ts
export const Public = () => SetMetadata('isPublic', true);
```

AuthGuard check করবে route public কিনা।

---

#### ৩️⃣ Request parameter handle করা

Example:

```ts
@Get()
getUser(@UserId() id: number)
```

---

#### ৪. NestJS এ Custom Decorator এর common ব্যবহার

| Use Case         | Example           |
| ---------------- | ----------------- |
| Authorization    | `@Roles('admin')` |
| Authentication   | `@Public()`       |
| Request data     | `@CurrentUser()`  |
| Custom parameter | `@UserId()`       |

---