import { User } from '../../users/entities/user.entity';

export interface EntityStatusInput {
  user?: User;
  showPrivate?: boolean;
}
