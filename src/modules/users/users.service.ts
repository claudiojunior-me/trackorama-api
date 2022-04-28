import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationError } from 'apollo-server-express';
import * as jwt from 'jsonwebtoken';
import { MongoRepository } from 'typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { LoginResponse, LoginUserInput } from './dto/login-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const { name, password, email } = createUserInput;
    const message = 'Email has already been taken.';

    const existedUser = await this.userRepository.findOneBy({ email });

    if (existedUser) {
      throw new Error(message);
    }

    const user = new User();
    user.email = email;
    user.name = name;
    user.password = password;

    return this.userRepository.save(user);
  }

  async findAll(offset?: number, limit?: number): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      skip: offset || 0,
      take: limit || 10,
      cache: true,
    });
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { _id: id, status: true },
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const { name, password, email } = updateUserInput;

    const user = await this.userRepository.findOneBy({ _id: id });
    user.name = name;
    user.password = password;
    user.email = email;

    return (await this.userRepository.save(user)) ? true : false;
  }

  async remove(id: string) {
    const user = new User();
    user._id = id;
    return (await this.userRepository.remove(user)) ? true : false;
  }

  async login(input: LoginUserInput): Promise<LoginResponse> {
    const { email, password } = input;
    const message = 'Incorrect email or password. Please try again.';

    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await user.matchesPassword(password))) {
      throw new AuthenticationError(message);
    }

    const token = await jwt.sign(
      {
        issuer: 'http://chnirt.dev.io',
        subject: user._id,
        audience: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '30d',
      },
    );

    return { token };
  }

  async findOneByToken(token: string) {
    const message = 'The token you provided was invalid.';
    let currentUser;

    try {
      const decodeToken = await jwt.verify(token, process.env.SECRET_KEY);

      currentUser = await this.userRepository.findOneBy({
        _id: decodeToken.sub,
      });
    } catch (error) {
      throw new AuthenticationError(message);
    }

    return currentUser;
  }
}
