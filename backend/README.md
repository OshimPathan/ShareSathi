# ShareSathi MVP Backend

This backend employs a strict Repository Pattern structure for separation of concerns.

## Architecture Guidelines
- **API**: Handles incoming HTTP requests and authentication routes to services.
- **Services**: Pure business logic (Calculations, API integrations, caching logic).
- **Repositories**: Exclusively handles SQLAlchemy asynchronous database commands.
- **Models vs Schemas**: `models` dir maps to Postgres tables. `schemas` dir validates input/output responses.

## Sub-Modules
- **AI**: Contains placeholders for ARIMA stock prediction logic.
- **WebSockets**: Broadcasts a live market loop via FastAPI `ConnectionManager`.
- **Background**: `APScheduler` tasks run mock end-of-day market synchronizations.
