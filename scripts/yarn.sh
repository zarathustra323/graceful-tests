#!/bin/bash
docker-compose run \
  --no-deps \
  --rm \
  app yarn $@
