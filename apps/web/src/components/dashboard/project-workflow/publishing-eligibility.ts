export function canPublishCreatorContent(emailVerifiedAt: string | null) {
  return emailVerifiedAt !== null;
}

export function creatorPublishingRequirementMessage(
  emailVerifiedAt: string | null,
) {
  return canPublishCreatorContent(emailVerifiedAt)
    ? null
    : 'Verify your email before publishing projects or versions.';
}
