# AI working agreement for this repo (Bloglist backend)

Use this guide to ship changes quickly and safely in this Node.js + Express 5 + Mongoose project.

## Architecture and flow
- Entry points: `app.js` wires middleware and routes; `index.js` reads `PORT` and starts the server. Exporting the Express app from `app.js` lets tests run without opening a port.
- Routing: `controllers/blogs.js` mounts at `/api/blogs` and implements CRUD:
  - GET `/` → `Blog.find({})` returns all blogs
  - POST `/` → create blog from `request.body`
  - DELETE `/:id` → `Blog.findByIdAndDelete`
  - PUT `/:id` → `Blog.findByIdAndUpdate` with `{ new: true, runValidators: true, context: 'query' }` (keep these options so Mongoose validations apply on updates).
- Data model: `models/blog.js` defines required `title` and `url`, optional `author`, and `likes` with default `0`. Schema `toJSON`:
  - Adds `id` (stringified `_id`)
  - Removes `_id` and `__v`
  Tests and clients rely on `id` (not `_id`). Preserve this transform in any new models.

## Middleware and errors
- Order in `app.js` matters: `requestLogger` → routes → `unknownEndpoint` → `errorHandler`.
- Error handling: Using Express 5; thrown/rejected async errors are forwarded automatically. `ValidationError` → `400` JSON; `CastError` (bad ObjectId) → `400` `{ error: 'malformatted id' }`.
- Logging: `utils/logger.js` silences logs when `NODE_ENV=test`. Use `logger.info/error` instead of `console.*` in app code.

## Testing conventions (node:test + supertest)
- Runner: Node’s built-in test runner (see `package.json`: `node --test`). `jest` is present in devDependencies but is not used.
- HTTP tests: `tests/blog_api.test.js` uses `supertest(app)`; DB state per test suite:
  - `beforeEach`: `Blog.deleteMany({}); Blog.insertMany(initialBlogs)`
  - `after`: close `mongoose.connection`.
- Assertions: `node:assert`.
- Expectations enforced by tests:
  - Responses include `id` and never `_id`.
  - Missing `likes` defaults to `0`.
  - Missing required `title` or `url` → `400`.
  - PUT expects full blog shape; validations run due to the update options above.
- Unit utils: `tests/list_helper.test.js` targets `utils/list_helper.js`; use `lodash` (`_.groupBy`, `_.sumBy`, `_.maxBy`).

## Environment and running
- Config: `utils/config.js` selects `TEST_MONGODB_URI` when `NODE_ENV=test`, else `MONGODB_URI`. Variables come from `.env` (via `dotenv`). Required: `PORT`, `MONGODB_URI`, `TEST_MONGODB_URI`.
- Scripts (Windows-safe via `cross-env`):
  - Dev: `npm run dev` (watch mode, `NODE_ENV=development`)
  - Test: `npm test` (`NODE_ENV=test node --test`)
  - Start: `npm start` (`NODE_ENV=production node index.js`)
- Static files: `app.use(express.static('dist'))` serves a built frontend when present; not needed for tests.
- Note: `mongo.js` is a manual script with a hard-coded URI; don’t use it in normal app flow or tests.
- Module type: CommonJS (`"type": "commonjs"`). Don’t convert to ESM without updating imports throughout.

## When adding features
- New routes: add a router under `controllers/` and mount it in `app.js`. Use async handlers; rely on Express 5 async error forwarding.
- Model changes: update the Mongoose schema and keep the `toJSON` transform (map `id`, hide `_id`/`__v`). Add `required` where behavior is validated in tests.
- Updates: always pass `{ new: true, runValidators: true, context: 'query' }` to `findByIdAndUpdate`.
- Tests: mirror existing `supertest` + `node:test` style; reset DB in `beforeEach` and close the connection in `after`.

## Quick examples
- Validate `id` mapping: GET `/api/blogs` returns objects with `id`, not `_id`.
- Create with default likes: POST `{ title, author, url }` returns `likes: 0`.
- Update likes: PUT `/api/blogs/:id` with the full blog body and a changed `likes` value returns the updated document.

If anything above is unclear or missing (e.g., auth, CI, or frontend build steps), tell me and I’ll refine these instructions.