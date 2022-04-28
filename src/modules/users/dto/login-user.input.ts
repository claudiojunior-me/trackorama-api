import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserInput {
  @IsString()
  @IsNotEmpty()
  email: string;

  @Length(1, 8, {
    message: 'Your password must be between 1 and 8 characters.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponse {
  @IsString()
  token: string;
}
