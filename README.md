<img src="https://www.plezanje.net/images/climbing_homepage.gif"  /></a>

# Graphql API

## Description

Graphql API from plezanje.net website written in [NestJS](https://nestjs.com/).

## Pre reqisites

[Node.js](https://nodejs.org/en/) and [Docker Desktop](https://www.docker.com/get-started).

## Installation

```bash
# Install packages
$ npm install
# Install nest CLI (recommended)
$ npm install -g @nestjs/cli
# Start up docker container for PostgreSQL
$ docker-compose up -d
# Option #1: Dump database from test server and restore it into your database (`api_postgres_1` might differ on your machine), you will need to get the password from someone
$ docker exec -it api_postgres_1 bash -c  "psql -U plezanjenet -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' && pg_dump -h plezanje.info -U plezanjenet -f /home/plezanjenet.sql plezanjenet && psql -U plezanjenet -f /home/plezanjenet.sql"
# Option #2: Use the precreated lite dump from the server
$ docker exec -it api_postgres_1 bash -c  "wget https://plezanje.info/storage/db_lite.sql && psql -U plezanjenet -f db_lite.sql"
```

Copy the `.env.example` file to `.env` and set configuration parameters.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
