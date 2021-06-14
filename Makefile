
## ====================
## CI tasks
## ====================

ci: test_pact publish_pacts

## =====================
## Build/test tasks
## =====================

test_pact: .env
	@echo "\n========== STAGE: test (pact) ==========\n"
	npm run test

publish_pacts: .env
	@echo "\n========== STAGE: publish pacts ==========\n"
	npm run posttest:pact

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