import { QueryRunner } from 'typeorm';
import {
  ActivityRoute,
  AscentType,
  firstTickAscentTypes,
  firstTrTickAscentTypes,
  tickAscentTypes,
  trTickAscentTypes,
} from '../../activities/entities/activity-route.entity';
import { SideEffect } from '../../activities/utils/side-effect.class';

function isTick(ascentType: AscentType) {
  return tickAscentTypes.has(ascentType);
}

function isTrTick(ascentType: AscentType) {
  return trTickAscentTypes.has(ascentType);
}

/**
 * Find user's first tick of a route after the date and convert it to repeat if one exists
 */
async function convertFirstTickAfterToRepeat(
  routeId: string,
  userId: string,
  date: Date,
  queryRunner: QueryRunner,
  sideEffects: SideEffect[] = [],
) {
  const futureTick = await queryRunner.manager
    .createQueryBuilder(ActivityRoute, 'ar')
    .where('ar.route_id = :routeId', { routeId: routeId })
    .andWhere('ar.user_id = :userId', { userId: userId })
    .andWhere('ar.ascent_type IN (:...aTypes)', {
      aTypes: [...firstTickAscentTypes],
    })
    .andWhere('ar.date > :arDate', { arDate: date })
    .orderBy('ar.date', 'ASC') // not realy neccesary, but just in case
    .getOne(); // If data is valid there can only be one such ascent logged (or none)

  // We do have a tick in the future
  if (futureTick) {
    // Remember current activity route state
    const futureTickBeforeChange = new ActivityRoute();
    queryRunner.manager.merge(
      ActivityRoute,
      futureTickBeforeChange,
      futureTick,
    );

    // Convert it to repeat
    futureTick.ascentType = AscentType.REPEAT;
    await queryRunner.manager.save(futureTick);
    sideEffects.push({ before: futureTickBeforeChange, after: futureTick });
  }
}

/**
 * Find user's first toprope tick of a route after the date and convert it to toprope repeat if one exists
 */
async function convertFirstTrTickAfterToTrRepeat(
  routeId: string,
  userId: string,
  date: Date,
  queryRunner: QueryRunner,
  sideEffects: SideEffect[] = [],
) {
  const futureTrTick = await queryRunner.manager
    .createQueryBuilder(ActivityRoute, 'ar')
    .where('ar.route_id = :routeId', { routeId: routeId })
    .andWhere('ar.user_id = :userId', { userId: userId })
    .andWhere('ar.ascent_type IN (:...aTypes)', {
      aTypes: [...firstTrTickAscentTypes],
    })
    .andWhere('ar.date > :arDate', { arDate: date })
    .getOne(); // If data is valid there can only be one such ascent logged (or none)

  // We do have a toprope tick in the future
  if (futureTrTick) {
    // Remember current activity route state
    const futureTrTickBeforeChange = new ActivityRoute();
    queryRunner.manager.merge(
      ActivityRoute,
      futureTrTickBeforeChange,
      futureTrTick,
    );

    // Convert it to toprope repeat
    futureTrTick.ascentType = AscentType.T_REPEAT;
    await queryRunner.manager.save(futureTrTick);
    sideEffects.push({
      before: futureTrTickBeforeChange,
      after: futureTrTick,
    });
  }
}

/**
 * Find user's first onsight or flash of a route after the date and convert it to redpoint if one exists
 */
async function convertFirstSightOrFlashAfterToRedpoint(
  routeId: string,
  userId: string,
  date: Date,
  queryRunner: QueryRunner,
  sideEffects: SideEffect[] = [],
) {
  const futureSightOrFlash = await queryRunner.manager
    .createQueryBuilder(ActivityRoute, 'ar')
    .where('ar.route_id = :routeId', { routeId: routeId })
    .andWhere('ar.user_id = :userId', { userId: userId })
    .andWhere('ar.ascent_type IN (:...aTypes)', {
      aTypes: [AscentType.ONSIGHT, AscentType.FLASH],
    })
    .andWhere('ar.date > :arDate', { arDate: date })
    .getOne(); // If data is valid there can only be one such ascent logged (or none)

  // We do have a flash/onsight in the future
  if (futureSightOrFlash) {
    // Remember current activity route state
    const futureSightOrFlashBeforeChange = new ActivityRoute();
    queryRunner.manager.merge(
      ActivityRoute,
      futureSightOrFlashBeforeChange,
      futureSightOrFlash,
    );

    // Convert it to redpoint
    futureSightOrFlash.ascentType = AscentType.REDPOINT;
    await queryRunner.manager.save(futureSightOrFlash);
    sideEffects.push({
      before: futureSightOrFlashBeforeChange,
      after: futureSightOrFlash,
    });
  }
}

/**
 * Find user's first toprope onsight or toprope flash of a route after the date and convert it to toprope redpoint if one exists
 */
async function convertFirstTrSightOrFlashAfterToTrRedpoint(
  routeId: string,
  userId: string,
  date: Date,
  queryRunner: QueryRunner,
  sideEffects: SideEffect[] = [],
) {
  const futureTrSightOrFlash = await queryRunner.manager
    .createQueryBuilder(ActivityRoute, 'ar')
    .where('ar.route_id = :routeId', { routeId: routeId })
    .andWhere('ar.user_id = :userId', { userId: userId })
    .andWhere('ar.ascent_type IN (:...aTypes)', {
      aTypes: [AscentType.T_ONSIGHT, AscentType.T_FLASH],
    })
    .andWhere('ar.date > :arDate', { arDate: date })
    .getOne(); // If data is valid there can only be one such ascent logged (or none)

  // We do have a toprope flash/onsight in the future
  if (futureTrSightOrFlash) {
    // Remember current activity route state
    const futureTrSightOrFlashBeforeChange = new ActivityRoute();
    queryRunner.manager.merge(
      ActivityRoute,
      futureTrSightOrFlashBeforeChange,
      futureTrSightOrFlash,
    );

    // Convert it to toprope redpoint
    futureTrSightOrFlash.ascentType = AscentType.T_REDPOINT;
    await queryRunner.manager.save(futureTrSightOrFlash);
    sideEffects.push({
      before: futureTrSightOrFlashBeforeChange,
      after: futureTrSightOrFlash,
    });
  }
}

export {
  isTick,
  isTrTick,
  convertFirstSightOrFlashAfterToRedpoint,
  convertFirstTickAfterToRepeat,
  convertFirstTrSightOrFlashAfterToTrRedpoint,
  convertFirstTrTickAfterToTrRepeat,
};
