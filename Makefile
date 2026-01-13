.PHONY: up down build logs shell

up:
	docker compose -f docker-compose.yml up -d

down:
	docker compose -f docker-compose.yml down

build:
	docker compose -f docker-compose.yml build

logs:
	docker compose -f docker-compose.yml logs -f

log:
	docker compose -f docker-compose.yml logs -f app

shell:
	docker compose -f docker-compose.yml exec app sh
