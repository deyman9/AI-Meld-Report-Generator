#!/bin/sh
set -e

echo "Running Prisma db push to sync database schema..."
npx prisma db push --accept-data-loss

echo "Starting the application..."
exec node server.js

