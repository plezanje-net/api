import { InputType } from '@nestjs/graphql';
import { InputWithUser } from '../../crags/utils/input-with-user.interface';
import { User } from '../../users/entities/user.entity';
import { FindContributionsInput } from './find-contributions.input';

@InputType()
export class FindContributionsServiceInput extends FindContributionsInput
  implements InputWithUser {
  user?: User;
}
