# Graceful Shutdown and Health Check Tests

## Running
To start, execute `docker-compose up`. To stop, execute `docker-compose down`. To execute Yarn commands (add, remove, etc) inside the container, run `docker-compose run --no-deps --rm app yarn [yarn-command] [args]`

## Considerations
1. In a large application, should a dead connection restart the entire app? For example, Redis is used (generally) for auth session storage. If Redis goes down, authenticated aspects of the app will fail. Other, anonymous (non-Redis connected) endpoints could continue to run. The same is true for any other external services. The failure needs to be recovered from eventually, but how quickly? This situation presents a strong case for microservices.
