import { type PublicUserProfile } from '../../../lib/users.ts';

type ProfileStatCounts = Pick<
  PublicUserProfile,
  | 'collectionCount'
  | 'followedProjectCount'
  | 'friendCount'
  | 'organizationCount'
  | 'projectCount'
>;

export function profileStatCounts(profile: ProfileStatCounts) {
  return {
    collections: profile.collectionCount,
    following: profile.followedProjectCount,
    friends: profile.friendCount,
    organizations: profile.organizationCount,
    projects: profile.projectCount,
  };
}
