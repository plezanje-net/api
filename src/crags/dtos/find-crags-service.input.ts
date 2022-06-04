import { InputType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { InputWithUser } from '../utils/input-with-user.interface';
import { FindCragsInput } from './find-crags.input';

@InputType()
export class FindCragsServiceInput extends FindCragsInput
  implements InputWithUser {
  id?: string;
  user?: User;
}
