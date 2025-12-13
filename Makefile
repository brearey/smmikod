include .env

DB_HOST := localhost

all: start

build:
	npm run build

start:
	npm run prod

stop:
	pm2 stop 0
	pm2 delete 0

out:
	tail -n 100 ~/.pm2/logs/index-out.log

error:
	tail -n 100 ~/.pm2/logs/index-error.log

up:
	docker compose up -d --build

down:
	docker compose down -v

exec:
	docker exec -it smmikod sh

connect:
	psql -h $(DB_HOST) -d $(POSTGRES_DB) -U $(POSTGRES_USER)

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

clean:
	@npm run clean
	@rm -rf dist