CREATE TYPE "OAuthClientStatus" AS ENUM ('ACTIVE', 'REVOKED');

CREATE TABLE "oauth_clients" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "homepageUrl" TEXT,
    "status" "OAuthClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "oauth_client_redirect_uris" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_client_redirect_uris_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_clients_clientId_key" ON "oauth_clients"("clientId");
CREATE INDEX "oauth_clients_ownerId_status_idx" ON "oauth_clients"("ownerId", "status");
CREATE UNIQUE INDEX "oauth_client_redirect_uris_clientId_uri_key" ON "oauth_client_redirect_uris"("clientId", "uri");

ALTER TABLE "oauth_clients" ADD CONSTRAINT "oauth_clients_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "oauth_client_redirect_uris" ADD CONSTRAINT "oauth_client_redirect_uris_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
