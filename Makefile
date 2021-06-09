# Default to the read only token - the read/write token will be present on Travis CI.
# It's set as a secure environment variable in the .travis.yml file
PACTICIPANT := "thanh-consumer"
PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli:latest"

# Only deploy from master
ifeq ($(TRAVIS_BRANCH),master)
	DEPLOY_TARGET=deploy
else
	DEPLOY_TARGET=no_deploy
endif

all: test

## ====================
## CI tasks
## ====================

ci: test publish_pacts can_i_deploy $(DEPLOY_TARGET)

publish_pacts: .env
	@echo "\n========== STAGE: publish pacts ==========\n"
	@"${PACT_CLI}" publish ${PWD}/pacts --consumer-app-version ${TRAVIS_COMMIT} --tag ${TRAVIS_BRANCH}

## =====================
## Build/test tasks
## =====================

test: .env
	@echo "\n========== STAGE: test (pact) ==========\n"
	npm run test:pact

## =====================
## Deploy tasks
## =====================

deploy: deploy_app tag_as_prod

no_deploy:
	@echo "Not deploying as not on master branch"

can_i_deploy: .env
	@echo "\n========== STAGE: can-i-deploy? ==========\n"
	@"${PACT_CLI}" broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${TRAVIS_COMMIT} \
	  --to prod \
	  --retry-while-unknown 0 \
	  --retry-interval 10

deploy_app:
	@echo "\n========== STAGE: deploy ==========\n"
	@echo "Deploying to prod"

tag_as_prod: .env
	@"${PACT_CLI}" broker create-version-tag --pacticipant ${PACTICIPANT} --version ${TRAVIS_COMMIT} --tag prod

## ======================
## Misc
## ======================

.env:
	touch .env

output:
	mkdir -p ./pacts
	touch ./pacts/tmp

clean: output
	rm pacts/*