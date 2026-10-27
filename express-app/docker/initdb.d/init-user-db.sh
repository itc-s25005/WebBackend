#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER express ENCRYPTED PASSWORD 'bun+typescript';
  CREATE DATABASE express_app OWNER express;
  GRANT ALL ON DATABASE express_app TO express;
EOSQL