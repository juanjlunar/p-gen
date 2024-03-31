import { $eq, $and, and, eq, $or, $not, or, not } from '@ucast/mongo2js';
import {
  AbilityOptionsOf,
  InferSubjects,
  MongoAbility,
  RawRuleOf,
  buildMongoQueryMatcher,
  createMongoAbility,
} from '@casl/ability';
import { JSONInterpolate } from './json-interpolate.util';

const conditionsMatcher = buildMongoQueryMatcher(
  { $and, $eq, $or, $not },
  { and, eq, or, not },
);

export function defineAbilityfor(
  user: {
    id: string;
    email?: string;
    user_roles: { user_id: string; role: string }[];
  },
  permissionsJSON: string,
) {
  const mongoAbilityOptions: AbilityOptionsOf<AppAbility> = {
    detectSubjectType:
      /* istanbul ignore next */
      // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any
      (item: any) => item?.__customSubject,
    conditionsMatcher,
  };

  /**
   * Interpolating the user variable into the permissions array.
   * We could query the permissions in a JSON string so we don't have to stringify first.
   *
   */
  const interpolatedPermissions = JSONInterpolate(permissionsJSON, {
    user,
  }) as unknown as RawRuleOf<AppAbility>[];

  return createMongoAbility<AppAbility>(
    interpolatedPermissions as unknown as RawRuleOf<AppAbility>[],
    mongoAbilityOptions,
  );
}

type Actions = 'READ' | 'INSERT' | 'UPDATE' | 'DELETE';

export enum Subjects {
  User = 'USER',
}

export type ComposedSubjects = InferSubjects<Subjects | UserDto | 'all'>;

export type AppAbility = MongoAbility<[Actions, ComposedSubjects]>;

type UserDto = {
  __customSubject: Subjects.User;
  id?: string;
  email?: string;
  user_roles?: {
    user_id?: string;
    role?: string;
  }[];
};
