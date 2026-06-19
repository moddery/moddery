CREATE TABLE "user_totp_secrets" (
  "userId" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_totp_secrets_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "user_totp_secrets"
  ADD CONSTRAINT "user_totp_secrets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
