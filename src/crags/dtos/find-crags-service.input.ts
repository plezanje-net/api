import { InputType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { EntityStatusInput } from '../utils/entity-status-input.interface';
import { FindCragsInput } from './find-crags.input';

@InputType()
export class FindCragsServiceInput extends FindCragsInput
  implements EntityStatusInput {
  user?: User;
}
