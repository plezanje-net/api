<img src="https://www.plezanje.net/images/climbing_homepage.gif"  /></a>

# Graphql API

## Description

Graphql API from plezanje.net website written in [NestJS](https://nestjs.com/).

## Pre reqisites

Node & npm package manager, PostgreSQL server.

## Installation

```bash
$ npm install
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

### Deploying to google cloud

Make sure to set the correct .env file before deployment
```
$ nest build
$ gcloud app deploy
```