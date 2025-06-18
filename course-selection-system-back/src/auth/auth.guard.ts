import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    let username:string;
    let userpassword:string;
    if(req.method=='GET'){
      username = req.query.username as string;
      userpassword = req.query.userpassword as string;
    }else if(req.method=='PUT'){
      username = req.body.username as string;
      userpassword = req.body.userpassword as string;
      const { username: _, userpassword: __, ...body } = req.body;
      req.body = body;
    }else{
      username = req.body.username as string;
      userpassword = req.body.userpassword as string;
    }
    if (!username || !userpassword) {
      throw new UnauthorizedException('请提供 name 和 password');
    }
    const user = await this.authService.validateUser(username, userpassword);
    req.user = user;
    return true;
  }
}