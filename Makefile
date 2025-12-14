include .env

all: up

rebuild: down up

restart:
	docker compose stop app
	docker compose rm -f app
	docker compose up -d --build --no-deps app

up:
	docker compose up -d --build app database

down:
	docker compose stop app database
	docker compose rm -f app database

exec:
	docker exec -it smmikod-app sh

exec-db:
	docker exec -it smmikod-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

logs:
	docker compose logs -f || true

logs-app:
	docker compose logs -f app || true

connect:
	psql -h $(POSTGRES_HOST) -d $(POSTGRES_DB) -U $(POSTGRES_USER)

test:
	npm run test

test_tickets:
	curl -X GET \
  "http://localhost:$(SERVER_PORT)/GetTickets?dateTimeFrom=2025-01-05T14%3a45%3a37%2b03%3a00&dateTimeTo=2025-03-15T14%3a45%3a37%2b03%3a00&limit=500&offset=0" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "IDENT-Integration-Key: $(IDENT_INTEGRATION_KEY)" \
	| jq

test_tickets_prod:
	curl -X GET \
  "http://176.109.105.218:$(SERVER_PORT)/GetTickets?dateTimeFrom=2025-12-12T14%3a45%3a37%2b03%3a00&dateTimeTo=2025-12-30T14%3a45%3a37%2b03%3a00&limit=500&offset=0" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "IDENT-Integration-Key: $(IDENT_INTEGRATION_KEY)" \
	| jq

test_timetable:
	curl -X POST \
	"http://localhost:$(SERVER_PORT)/PostTimeTable" \
	-H "Content-Type: application/json" \
	-H "Accept: application/json" \
	-H "IDENT-Integration-Key: $(IDENT_INTEGRATION_KEY)" \
	-d @__tests__/timetable.json

fmt:
	npm run lint
	npm run format

clean:
	@npm run clean
	@rm -rf dist