# Graceful Shutdown and Health Check Tests

## Running
_You must have Docker Engine 18.06.0+ to run this application (due to compose file format 3.7)_

To start, execute `docker-compose up`. To stop, execute `docker-compose down`.

## Yarn / NPM
Do **not** use Yarn (nor NPM, for that matter) on your local machine to add/remove packages. Instead, use the `yarn.sh` script to ensure commands are executed inside the Docker container. As such, you do not need Yarn installed locally. For example, to add a package run `scripts/yarn.sh add [package-name]`.

## Considerations
1. In a large application, should a dead connection restart the entire app? For example, Redis is used (generally) for auth session storage. If Redis goes down, authenticated aspects of the app will fail. Other, anonymous (non-Redis connected) endpoints could continue to run. The same is true for any other external services. The failure needs to be recovered from eventually, but how quickly? This situation presents a strong case for microservices.
