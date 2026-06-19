# Moddery

Moddery is an independent home for Minecraft creators, players, and the people who keep the modding web weird, useful, and open.

We build for projects that should be easy to publish, easy to discover, and easy to preserve. We do not need another locked garden. We need fast tools, clear rules, portable data, and a community that can fork, fix, and keep moving.

Reviews should be fast, human, and transparent, so creators can spend their time making things instead of waiting in line.

Join us on [Discord](https://discord.gg/JmPd3PvNrR).

## Development

This monorepo uses Bun workspaces.

```sh
bun install
bun run dev
```

Run the local infrastructure:

```sh
docker compose up --build
```

Run the Docker development stack with bind-mounted source and watch mode:

```sh
bun run docker:dev
```

Use `bun run docker:dev:detached` to start it in the background and
`bun run docker:dev:down` to stop it. The development overlay runs the API with
Nest watch mode and the web app with Vite, so application source changes do not
require rebuilding Docker images.

The web app is exposed at `http://localhost:15175` for the production Compose
stack and `http://localhost:15174` for the Docker development stack. The API is
exposed at `http://localhost:13001`, Postgres at `localhost:5433`, Redis at
`localhost:6380`, OpenSearch at `http://localhost:9200`, ClickHouse at
`http://localhost:8123`, Mailpit at `http://localhost:8026`, and the MinIO
console at `http://localhost:9003`.

Useful checks:

```sh
bun run check
bun run test
bun run build
```

Prisma commands for the API:

```sh
bun run --filter @moddery/api prisma:generate
bun run --filter @moddery/api prisma:migrate:dev
bun run db:migrate:deploy
```

Seed local catalog data:

```sh
bun run seed:popular-projects
```

`SEED_PROJECT_LIMIT` is applied per project type.
