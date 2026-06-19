import { gql } from '@apollo/client';

export const ADMIN_AUDIT_LOG_SEARCH_QUERY = gql`
  query AdminAuditLogSearch($limit: Int!, $offset: Int!) {
    adminAuditLogSearch(limit: $limit, offset: $offset) {
      auditLogs {
        action
        actor {
          displayName
          id
          username
        }
        actorId
        after {
          role
          status
        }
        before {
          role
          status
        }
        createdAt
        id
        moderationAction
        projectAfter {
          id
          projectKind
          requestedStatus
          slug
          status
          title
        }
        projectBefore {
          id
          projectKind
          requestedStatus
          slug
          status
          title
        }
        reason
        reportAfter {
          id
          reason
          state
          targetId
          targetKind
          targetLabel
        }
        reportBefore {
          id
          reason
          state
          targetId
          targetKind
          targetLabel
        }
        resource {
          id
          kind
          name
          projectKind
          slug
        }
        securityAction
        targetUser {
          displayName
          id
          username
        }
        targetUserId
        teamMemberAction
        teamMemberAfter {
          accepted
          owner
          permissions
          role
          username
        }
        teamMemberBefore {
          accepted
          owner
          permissions
          role
          username
        }
        versionAfter {
          id
          name
          projectSlug
          requestedStatus
          status
          versionNumber
        }
        versionBefore {
          id
          name
          projectSlug
          requestedStatus
          status
          versionNumber
        }
      }
      totalHits
    }
  }
`;
