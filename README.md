Catfish API (Real‑time Rooms & Chat)

Overview

Catfish API is a real‑time backend built with Node.js, TypeScript, Express, Socket.IO, and Drizzle ORM (PostgreSQL). It manages ephemeral 1:1 rooms, basic chat messaging, and room state toggles (camera/mic/stream) over WebSockets.

Key features

- Real‑time signaling: Socket.IO server with namespaced event contracts
- Room lifecycle: Auto‑create/join, mark full, leave, and cleanup
- Chat relay: Broadcast messages within a room
- Secure & production‑ready defaults: Helmet, CORS, compression, morgan
- PostgreSQL with Drizzle ORM and migrations

Tech stack

- Runtime: Node.js (ESM) + TypeScript
- HTTP: Express (minimal REST; primary interface is WebSockets)
- Realtime: Socket.IO
- Database: PostgreSQL via Drizzle ORM
- Migrations: drizzle-kit + node-postgres migrator

Getting started

Prerequisites

- Node.js 18+
- PostgreSQL 13+

Installation

```bash
npm install
```

Environment variables

Create a .env file at the repo root. The server dynamically chooses development vs production credentials based on NODE_ENV. All variables are required in their respective environment.

```bash
# General
PORT=8080
NODE_ENV=development # or production

# Development database
DEV_DATABASE_HOST=localhost
DEV_DATABASE_PORT=5432
DEV_DATABASE_NAME=catfish_dev
DEV_DATABASE_USERNAME=postgres
DEV_DATABASE_PASSWORD=postgres

# Production database
PROD_DATABASE_HOST=<host>
PROD_DATABASE_PORT=5432
PROD_DATABASE_NAME=catfish_prod
PROD_DATABASE_USERNAME=<user>
PROD_DATABASE_PASSWORD=<password>
```

Database setup

1) Create the database(s) listed above.
2) Run migrations:

```bash
npx tsx migrate.ts
```

This uses the drizzle migrator to apply SQL files under drizzle/.

Run the server

- Development (watch mode):

```bash
npm run dev
```

- Production:

```bash
npm run start
```

When the server starts, it logs the URL and DB connection status. By default CORS is open (origin: "*") for Socket.IO; adjust for your deployment needs.

Project structure

```text
src/
  server.ts                      # Express + Socket.IO bootstrap
  config/database.ts             # Drizzle client and DB URL composition
  events/                        # Socket.IO wiring
    index.ts                     # Socket initialization entry
    socketManager.ts             # Per-connection orchestration
    handlers/chatHandler.ts      # Chat events
  features/rooms/
    constants/events.ts          # Room event names (client/server)
    controllers/roomController.ts# Room lifecycle + toggles
    models/roomModel.ts          # Drizzle schema (rooms)
  features/chat/
    constants/events.ts          # Chat event names
    types/index.ts               # Chat message type
  common/                        # Errors and plumbing
    classes/AppError.ts
    controllers/errorController.ts
  helpers/catchAsync.ts
  utils/database/enumToPgEnum.ts
drizzle/                         # SQL migrations
migrate.ts                       # Migration runner
```

Database schema

Table rooms

- id: serial primary key
- is_full: boolean (default false)
- members_count: integer (default 1)

Runtime behavior

- On first user join when no room is available, create a room and join them.
- On second user join, mark the room as full (members_count=2) and notify the peer.
- When a user disconnects/leaves:
  - If members_count was 2 → set is_full=false, members_count=1
  - If members_count was 1 → delete the room
  - Emit ready-to-join to the caller

WebSocket API (Socket.IO)

Namespace: default (/) — all events are emitted/listened on the connected socket.

Rooms events

Client → Server

- join-room (userId: string)
- leave-room ()
- toggle-camera (userId: string, alsoEmitToMe?: boolean)
- toggle-mic (userId: string, alsoEmitToMe?: boolean)
- stream-started ()

Server → Client

- user-joined (userId: string)
- camera-toggled (userId: string)
- mic-toggled (userId: string)
- ready-to-join ()
- stream-started ()

Chat events

Client → Server

- send-message (message: { userName: string; userId: string; messageContent: string })

Server → Client

- receive-message (same payload as above)

Client usage example

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:8080", { transports: ["websocket"] });

socket.on("connect", () => {
  // Join a room
  socket.emit("join-room", "user-123");

  // Send a chat message
  socket.emit("send-message", {
    userName: "alice",
    userId: "user-123",
    messageContent: "Hello!",
  });
});

socket.on("user-joined", (peerId: string) => {
  console.log("Peer joined:", peerId);
});

socket.on("receive-message", (msg) => {
  console.log("Message:", msg);
});

// Toggle UI state
function toggleCamera(userId: string) {
  socket.emit("toggle-camera", userId, true);
}

function toggleMic(userId: string) {
  socket.emit("toggle-mic", userId, true);
}

function startStream() {
  socket.emit("stream-started");
}
```

HTTP surface

The HTTP API is intentionally minimal. Any non‑defined route returns a 404 in JSON via the global error handler. Real‑time communication is the primary interface.

Security & production notes

- Helmet is enabled for HTTP security headers.
- CORS defaults to origin: "*" for Socket.IO; scope as needed.
- Compression is enabled.
- In production, the database connection uses sslmode=no-verify in the URL; ensure your environment requires/accepts SSL and tighten as appropriate.

Scripts

- npm run dev — Start server in watch mode (development)
- npm run start — Start server (production)
- npm run build — TypeScript build
- npx tsx migrate.ts — Apply DB migrations

Contributing

1) Fork the repository and create a feature branch.
2) Write clear, typed code and keep functions small and purposeful.
3) Add tests where applicable (server currently does not include a test harness).
4) Open a pull request with a concise description and screenshots/logs if relevant.

License

ISC (see package.json). You may adapt license as needed for your organization.

Troubleshooting

- ECONNREFUSED when connecting to DB: verify host/port, credentials, and that the DB is reachable.
- Socket doesn’t receive events: confirm the socket joined a room (join-room) and that socket.data["roomID"] is set by the server after joining.
- Migrations stuck or fail: ensure drizzle/ exists, the DB user has DDL privileges, and re‑run npx tsx migrate.ts.


