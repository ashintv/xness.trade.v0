#!/bin/bash
set -e

# Wait for Postgres to be ready
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  echo "Waiting for Postgres..."
  sleep 2
done

# Run the schema SQL
echo "Running schema.sql..."
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /app/init/schema.sql

# Start your Node app
echo "Starting get_stream..."
node dist/index.js