import { QueryRunner } from 'typeorm';
import {
  ActivityRoute,
  AscentType,
} from '../../activities/entities/activity-route.entity';
import { Route } from '../entities/route.entity';

/**
 * Given a rotue id, get all activity routes for the route and recalculate the fields orderScore and rankingScore
 * @param routeId
 * @param queryRunner
 */
async function recalculateActivityRoutesScores(
  routeId: string,
  queryRunner: QueryRunner,
) {
  const otherActivityRoutes = await queryRunner.manager.findBy(ActivityRoute, {
    routeId,
  });
  const route = await queryRunner.manager.findOneBy(Route, { id: routeId });
  console.log(otherActivityRoutes);
  for (const otherActivityRoute of otherActivityRoutes) {
    otherActivityRoute.orderScore = calculateScore(
      route.difficulty,
      otherActivityRoute.ascentType,
      'order',
    );
    otherActivityRoute.rankingScore = calculateScore(
      route.difficulty,
      otherActivityRoute.ascentType,
      'ranking',
    );
    await queryRunner.manager.save(otherActivityRoute);
  }
}

/**
 * returns calculated score based on route's difficulty and ar's ascent type
 * @param difficulty
 * @param ascentType
 * @param scoreType
 * @returns either orderScore or rankingScore
 */
function calculateScore(
  difficulty: number,
  ascentType: AscentType,
  scoreType: 'order' | 'ranking',
): number {
  // only first (lead) ticks count towards ranking
  const scoreTypeFactor = scoreType === 'order' ? 1 : 0;

  switch (ascentType) {
    case AscentType.ONSIGHT:
      return difficulty + 100;
    case AscentType.FLASH:
      return difficulty + 50;
    case AscentType.REDPOINT:
      return difficulty;
    case AscentType.REPEAT:
      return (difficulty - 10) * scoreTypeFactor;
    case AscentType.ALLFREE:
      return difficulty * 0.01 * scoreTypeFactor;
    case AscentType.AID:
      return difficulty * 0.001 * scoreTypeFactor;
    case AscentType.ATTEMPT:
      return difficulty * 0.0001 * scoreTypeFactor;
    case AscentType.T_ONSIGHT:
      return (difficulty + 100) * 0.0001 * scoreTypeFactor;
    case AscentType.T_FLASH:
      return (difficulty + 50) * 0.0001 * scoreTypeFactor;
    case AscentType.T_REDPOINT:
      return difficulty * 0.0001 * scoreTypeFactor;
    case AscentType.T_REPEAT:
      return (difficulty - 10) * 0.0001 * scoreTypeFactor;
    case AscentType.T_ALLFREE:
      return difficulty * 0.01 * 0.0001 * scoreTypeFactor;
    case AscentType.T_AID:
      return difficulty * 0.001 * 0.0001 * scoreTypeFactor;
    case AscentType.T_ATTEMPT:
      return difficulty * 0.0001 * 0.0001 * scoreTypeFactor;
    case AscentType.TICK:
      // TODO: what is TICK ascent type, and is it even used?? prob not, 1 ar in db... suggest removal, discuss
      return 0;
  }
}

export { recalculateActivityRoutesScores, calculateScore };
