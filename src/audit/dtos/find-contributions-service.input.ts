import { InputType } from '@nestjs/graphql';
import { EntityStatusInput } from '../../crags/utils/entity-status-input.interface';
import { User } from '../../users/entities/user.entity';
import { FindContributionsInput } from './find-contributions.input';

@InputType()
export class FindContributionsServiceInput extends FindContributionsInput
  implements EntityStatusInput {
  user?: User;
}
