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
# Use the precreated database dump from the server
$ mkdir db
$ curl https://plezanje.net/storage/db.sql --output ./db/db.sql
$ docker exec -it api-postgres-1 bash -c  "psql -U plezanjenet -f /etc/db/db.sql"
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
