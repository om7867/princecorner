.PHONY: deploy build start stop restart logs ps clean check

# Deploy or update production containers
deploy:
	docker compose up -d --build

# Build images without starting
build:
	docker compose build

# Start existing built containers
start:
	docker compose up -d

# Stop running containers
stop:
	docker compose down

# Restart containers
restart:
	docker compose restart

# View live container logs
logs:
	docker compose logs -f

# Check container status
ps:
	docker compose ps

# Clean up stopped containers and unused images
clean:
	docker system prune -f

# Run health check on local backend endpoint
check:
	@curl -s http://127.0.0.1:8001/health || echo "Backend not running on port 8001"
