import { User } from '../../users/entities/user.entity';

export class FindRoutesServiceInput {
  id?: string;
  sectorId?: string;
  sectorIds?: string[];
  user?: User;
}
