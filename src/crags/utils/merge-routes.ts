import { QueryRunner } from 'typeorm';
import { ActivityRoute } from '../../activities/entities/activity-route.entity';
import { SideEffect } from '../../activities/utils/side-effect.class';
import { Transaction } from '../../core/utils/transaction.class';
import { Comment } from '../entities/comment.entity';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { RouteProperty } from '../entities/route-property.entity';
import { Route } from '../entities/route.entity';
import { StarRatingVote } from '../entities/star-rating-vote.entity';
import {
  convertFirstSightOrFlashAfterToRedpoint,
  convertFirstTickAfterToRepeat,
  convertFirstTrSightOrFlashAfterToTrRedpoint,
  convertFirstTrTickAfterToTrRepeat,
  isTick,
  isTrTick,
} from './convert-ascents';
import { recalculateActivityRoutesScores } from './calculate-scores';

async function mergeRoutes(
  route: Route,
  mergeWithRoute: Route,
  primaryRoute: string,
  transaction: Transaction,
): Promise<boolean> {
  const sourceRoute = primaryRoute === 'target' ? route : mergeWithRoute;
  const targetRoute = primaryRoute === 'target' ? mergeWithRoute : route;

  if (targetRoute.isProject && !sourceRoute.isProject) {
    targetRoute.isProject = false;
    transaction.save(targetRoute);
  }

  await transferDifficultyVotes(sourceRoute, targetRoute, transaction);

  await transferActivityRoutes(sourceRoute.id, targetRoute.id, transaction);
  await convertAscentTypesAfterRouteMerge(targetRoute, transaction.queryRunner);

  await transferStarRatings(sourceRoute.id, targetRoute.id, transaction);

  await transferComments(sourceRoute.id, targetRoute.id, transaction);

  await transferRouteProperties(sourceRoute.id, targetRoute.id, transaction);

  // recalculate scores of all activity routes whose route has been updated
  await recalculateActivityRoutesScores(
    targetRoute.id,
    transaction.queryRunner,
  );

  await transaction.delete(sourceRoute);

  return true;
}

async function transferActivityRoutes(
  routeId: string,
  targetId: string,
  transaction: Transaction,
) {
  const activityRoutes = await transaction.queryRunner.manager.find(
    ActivityRoute,
    {
      where: { routeId },
    },
  );
  for (const activityRoute of activityRoutes) {
    activityRoute.routeId = targetId;
    await transaction.save(activityRoute);
  }
}

async function transferDifficultyVotes(
  route: Route,
  target: Route,
  transaction: Transaction,
) {
  const difficultyVotes = await transaction.queryRunner.manager.find(
    DifficultyVote,
    {
      where: { routeId: route.id },
    },
  );
  for (const difficultyVote of difficultyVotes) {
    if (difficultyVote.isBase && !target.isProject) {
      await transaction.delete(difficultyVote);
      continue;
    }

    const existingUserVote = await transaction.queryRunner.manager.findOne(
      DifficultyVote,
      {
        where: {
          routeId: target.id,
          userId: difficultyVote.userId,
        },
      },
    );
    if (
      existingUserVote &&
      existingUserVote.created >= difficultyVote.created
    ) {
      await transaction.delete(difficultyVote);
      continue;
    }

    if (existingUserVote && existingUserVote.created < difficultyVote.created) {
      await transaction.delete(existingUserVote);
    }
    difficultyVote.routeId = target.id;
    await transaction.save(difficultyVote);
  }
}

async function transferStarRatings(
  routeId: string,
  targetId: string,
  transaction: Transaction,
) {
  const starRatingVotes = await transaction.queryRunner.manager.find(
    StarRatingVote,
    {
      where: { routeId: routeId },
    },
  );
  for (const starRatingVote of starRatingVotes) {
    const existingUserVote = await transaction.queryRunner.manager.findOne(
      StarRatingVote,
      {
        where: {
          routeId: targetId,
          userId: starRatingVote.userId,
        },
      },
    );
    if (
      existingUserVote &&
      existingUserVote.created >= starRatingVote.created
    ) {
      await transaction.delete(starRatingVote);
      continue;
    }

    if (existingUserVote && existingUserVote.created < starRatingVote.created) {
      await transaction.delete(existingUserVote);
    }
    starRatingVote.routeId = targetId;
    await transaction.save(starRatingVote);
  }
}

async function transferRouteProperties(
  routeId: string,
  targetId: string,
  transaction: Transaction,
) {
  const routeProperties = await transaction.queryRunner.manager.find(
    RouteProperty,
    {
      where: { routeId: routeId },
    },
  );
  for (const routeProperty of routeProperties) {
    const existingRouteProperty = await transaction.queryRunner.manager.findOne(
      RouteProperty,
      {
        where: {
          routeId: targetId,
          propertyTypeId: routeProperty.propertyTypeId,
        },
      },
    );
    if (existingRouteProperty) {
      await transaction.delete(routeProperty);
      continue;
    }

    routeProperty.routeId = targetId;
    await transaction.save(routeProperty);
  }
}

async function transferComments(
  routeId: string,
  targetId: string,
  transaction: Transaction,
) {
  const comments = await transaction.queryRunner.manager.find(Comment, {
    where: { routeId },
  });
  for (const comment of comments) {
    comment.routeId = targetId;
    await transaction.save(comment);
  }
}

async function convertAscentTypesAfterRouteMerge(
  route: Route,
  queryRunner: QueryRunner,
) {
  const activityRoutes = await queryRunner.manager.find(ActivityRoute, {
    where: { routeId: route.id },
    order: { date: 'ASC' },
  });
  for (const activityRoute of activityRoutes) {
    const args: [string, string, Date, QueryRunner, SideEffect[]] = [
      route.id,
      activityRoute.userId,
      activityRoute.date,
      queryRunner,
      [],
    ];
    if (isTick(activityRoute.ascentType)) {
      await convertFirstTickAfterToRepeat(...args);
      await convertFirstTrTickAfterToTrRepeat(...args);
      await convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    } else if (isTrTick(activityRoute.ascentType)) {
      await convertFirstSightOrFlashAfterToRedpoint(...args);
      await convertFirstTrTickAfterToTrRepeat(...args);
    } else {
      // it is only a try
      // there can really only be one of the below, so one of theese will do nothing. and also could do it in a single query, but leave as is for readability reasons
      await convertFirstSightOrFlashAfterToRedpoint(...args);
      await convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    }
  }
}

export { mergeRoutes };
