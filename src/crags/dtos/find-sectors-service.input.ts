import { User } from '../../users/entities/user.entity';

export class FindSectorsServiceInput {
  id?: string;
  cragId?: string;
  user?: User;
}
