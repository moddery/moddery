CREATE TABLE "moderation_locks" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_locks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "moderation_locks_projectId_key" ON "moderation_locks"("projectId");
CREATE INDEX "moderation_locks_moderatorId_idx" ON "moderation_locks"("moderatorId");
CREATE INDEX "moderation_locks_expiresAt_idx" ON "moderation_locks"("expiresAt");

ALTER TABLE "moderation_locks" ADD CONSTRAINT "moderation_locks_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_locks" ADD CONSTRAINT "moderation_locks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
