#!/bin/bash
set -e

# Start postgres in background
docker-entrypoint.sh postgres &

# Wait until Postgres is ready
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "⏳ Waiting for Postgres..."
  sleep 2
done

# Run your scripts every time container starts
for f in /app/init/*.sql; do
  echo "▶️ Running $f..."
  psql -U postgres -d xnessdbdev -f "$f"
done

# Keep Postgres running in foreground
wait -n