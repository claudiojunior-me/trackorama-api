import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

function createNewUser(
  id: string,
  name: string,
  email: string,
  pass: string,
  status?: boolean,
): User {
  const userCreated = new User();
  userCreated._id = id;
  userCreated.name = name;
  userCreated.email = email;
  userCreated.password = pass;
  userCreated.status = status;

  return userCreated;
}

const usersArray = [
  createNewUser('00001', 'User 001', 'user-001@email.com', 'user001PasS'),
  createNewUser('00002', 'User 002', 'user-002@email.com', 'user002PasS'),
  createNewUser('00003', 'User 003', 'user-003@email.com', 'user003PasS'),
];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue(usersArray),
            findOne: jest.fn().mockResolvedValue(usersArray[0]),
            findOneBy: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue(usersArray[0]),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual(usersArray);
    });
  });

  describe('getOne', () => {
    it('should get one user', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      expect(service.findOne('uuid')).resolves.toEqual(usersArray[0]);
      expect(repoSpy).toBeCalledWith({ where: { _id: 'uuid', status: true } });
    });
  });

  describe('insertOne', () => {
    it('should successfully insert a user', () => {
      const createUser: CreateUserInput = {
        name: 'user name',
        email: 'user@test.com',
        password: 'userPass001',
      };

      expect(service.create(createUser)).resolves.toEqual(usersArray[0]);
      expect(repo.findOneBy).toBeCalledTimes(1);
      expect(repo.findOneBy).toBeCalledWith({ email: 'user@test.com' });
      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith(createUser);
    });
  });

  describe('updateOne', () => {
    it('should call the update method', async () => {
      const updateUser: UpdateUserInput = {
        id: '00002',
        name: 'user name',
        email: 'user@test.com',
        password: 'userPass001',
      };

      const updatedUser = await service.update('00002', updateUser);
      expect(updatedUser).toEqual(usersArray[0]);
      expect(repo.save).toBeCalledTimes(1);
    });
  });

  // describe('deleteOne', () => {
  //   it('should return {deleted: true}', () => {
  //     expect(service.deleteOne('a uuid')).resolves.toEqual({ deleted: true });
  //   });
  //   it('should return {deleted: false, message: err.message}', () => {
  //     const repoSpy = jest
  //       .spyOn(repo, 'delete')
  //       .mockRejectedValueOnce(new Error('Bad Delete Method.'));
  //     expect(service.deleteOne('a bad uuid')).resolves.toEqual({
  //       deleted: false,
  //       message: 'Bad Delete Method.',
  //     });
  //     expect(repoSpy).toBeCalledWith({ id: 'a bad uuid' });
  //     expect(repoSpy).toBeCalledTimes(1);
  //   });
  // });
});
