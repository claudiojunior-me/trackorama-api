import * as bcrypt from 'bcrypt';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import {
  BeforeInsert,
  BeforeRemove,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as uuid from 'uuid';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: string;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: string;

  @BeforeInsert()
  async register() {
    this._id = await uuid.v4();
    this.status = true;
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async update() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeRemove()
  async block() {
    this.status = false;
  }

  async matchesPassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }
}
