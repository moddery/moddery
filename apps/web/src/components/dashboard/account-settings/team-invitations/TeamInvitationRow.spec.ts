import { describe, expect, test } from 'bun:test';

import { type TeamInvitationSummary } from '../../../../lib/dashboard/types.ts';
import { teamInvitationTargetHref } from './TeamInvitationRow.tsx';
import { teamInvitationActionMessage } from './useTeamInvitationsPanelState.ts';

describe(teamInvitationTargetHref.name, () => {
  test('links organization invitations to organization pages', () => {
    expect(
      teamInvitationTargetHref(
        targetFixture({
          projectKind: null,
          slug: 'build team',
          type: 'ORGANIZATION',
        }),
      ),
    ).toBe('/organizations/build%20team');
  });

  test('links project invitations with their project type', () => {
    expect(
      teamInvitationTargetHref(
        targetFixture({
          projectKind: 'PLUGIN',
          slug: 'server-tools',
          type: 'PROJECT',
        }),
      ),
    ).toBe('/plugins?project=server-tools&type=plugin');
  });

  test('does not link project invitations without a project kind', () => {
    expect(
      teamInvitationTargetHref(
        targetFixture({
          projectKind: null,
          slug: 'missing-kind',
          type: 'PROJECT',
        }),
      ),
    ).toBeNull();
  });
});

describe(teamInvitationActionMessage.name, () => {
  test('describes accepted and declined invitations', () => {
    const invitation = {
      target: targetFixture({ name: 'Core Plugins' }),
    };

    expect(teamInvitationActionMessage('accept', invitation)).toBe(
      'Accepted invitation to Core Plugins.',
    );
    expect(teamInvitationActionMessage('decline', invitation)).toBe(
      'Declined invitation to Core Plugins.',
    );
  });
});

function targetFixture(
  patch: Partial<TeamInvitationSummary['target']> = {},
): TeamInvitationSummary['target'] {
  return {
    id: 'target-a',
    name: 'Target',
    projectKind: null,
    slug: 'target',
    type: 'ORGANIZATION',
    ...patch,
  };
}
