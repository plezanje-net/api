import { InputType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@InputType()
export class FindSectorsServiceInput {
  user?: User;
  showPrivate?: boolean;
}
