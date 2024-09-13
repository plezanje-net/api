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
    case AscentType.onsight:
      return difficulty + 100;
    case AscentType.flash:
      return difficulty + 50;
    case AscentType.redpoint:
      return difficulty;
    case AscentType.repeat:
      return (difficulty - 10) * scoreTypeFactor;
    case AscentType.allfree:
      return difficulty * 0.01 * scoreTypeFactor;
    case AscentType.aid:
      return difficulty * 0.001 * scoreTypeFactor;
    case AscentType.attempt:
      return difficulty * 0.0001 * scoreTypeFactor;
    case AscentType.t_onsight:
      return (difficulty + 100) * 0.0001 * scoreTypeFactor;
    case AscentType.t_flash:
      return (difficulty + 50) * 0.0001 * scoreTypeFactor;
    case AscentType.t_redpoint:
      return difficulty * 0.0001 * scoreTypeFactor;
    case AscentType.t_repeat:
      return (difficulty - 10) * 0.0001 * scoreTypeFactor;
    case AscentType.t_allfree:
      return difficulty * 0.01 * 0.0001 * scoreTypeFactor;
    case AscentType.t_aid:
      return difficulty * 0.001 * 0.0001 * scoreTypeFactor;
    case AscentType.t_attempt:
      return difficulty * 0.0001 * 0.0001 * scoreTypeFactor;
    case AscentType.tick:
      // TODO: what is TICK ascent type, and is it even used?? prob not, 1 ar in db... suggest removal, discuss
      return 0;
  }
}

export { recalculateActivityRoutesScores, calculateScore };
