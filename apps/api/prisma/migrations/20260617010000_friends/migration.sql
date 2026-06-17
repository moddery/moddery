-- CreateEnum
CREATE TYPE "FriendState" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "friends" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "state" "FriendState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friends_requesterId_addresseeId_key" ON "friends"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "friends_addresseeId_state_idx" ON "friends"("addresseeId", "state");

-- CreateIndex
CREATE INDEX "friends_requesterId_state_idx" ON "friends"("requesterId", "state");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
