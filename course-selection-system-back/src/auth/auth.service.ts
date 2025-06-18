import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string, userpassword: string): Promise<User> {
    const user = await this.userService.findByName(username);
    if (!user || user.password !== userpassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return user;
  }
}