import { InputType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { InputWithUser } from '../utils/input-with-user.interface';
import { LatestDifficultyVotesInput } from './latest-difficulty-votes.input';

@InputType()
export class LatestDifficultyVotesInputServiceInput
  extends LatestDifficultyVotesInput
  implements InputWithUser {
  user?: User;
}
