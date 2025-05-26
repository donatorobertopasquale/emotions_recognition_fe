# Emotion Recognition Frontend Makefile
# A modern React application for emotion recognition using facial analysis technology

# Variables
DOCKER_IMAGE_NAME = emotions-recognition-fe
DOCKER_CONTAINER_NAME = emotions-fe-fixed
DOCKER_NETWORK = emotions_recognition_default
CONFIG_FILE = .config
NODE_VERSION = 20
PORTS_HTTPS = 443:443
PORTS_HTTP = 80:80

# Default target
.PHONY: help
help: ## Show this help message
	@echo "Emotion Recognition Frontend - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
.PHONY: install
install: ## Install project dependencies
	@echo "Installing dependencies..."
	npm install
	npm install bootstrap-icons

.PHONY: start
start: ## Start development server
	@echo "Starting development server..."
	npm start

.PHONY: build
build: ## Build the app for production
	@echo "Building the app for production..."
	npm run build

.PHONY: test
test: ## Run tests
	@echo "Running tests..."
	npm test

.PHONY: test-ci
test-ci: ## Run tests in CI mode
	@echo "Running tests in CI mode..."
	npm test -- --coverage --watchAll=false

.PHONY: lint
lint: ## Run ESLint
	@echo "Running ESLint..."
	npm run lint

.PHONY: lint-fix
lint-fix: ## Fix ESLint errors automatically
	@echo "Fixing ESLint errors..."
	npm run lint:fix

.PHONY: format
format: ## Format code with Prettier
	@echo "Formatting code..."
	npm run format

.PHONY: analyze
analyze: ## Analyze bundle size
	@echo "Analyzing bundle size..."
	npm run analyze

# Docker commands
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "Building Docker image: $(DOCKER_IMAGE_NAME)..."
	docker build -t $(DOCKER_IMAGE_NAME) .

.PHONY: docker-run
docker-run: ## Run Docker container with HTTPS only
	@echo "Running Docker container..."
	docker run --env-file $(CONFIG_FILE) -p $(PORTS_HTTPS) $(DOCKER_IMAGE_NAME)

.PHONY: docker-run-detached
docker-run-detached: ## Run Docker container in detached mode with both HTTP and HTTPS
	@echo "Running Docker container in detached mode..."
	docker run -d --env-file $(CONFIG_FILE) --name $(DOCKER_CONTAINER_NAME) --network $(DOCKER_NETWORK) -p $(PORTS_HTTPS) -p $(PORTS_HTTP) $(DOCKER_IMAGE_NAME)

.PHONY: docker-stop
docker-stop: ## Stop Docker container
	@echo "Stopping Docker container..."
	docker stop $(DOCKER_CONTAINER_NAME) || true

.PHONY: docker-remove
docker-remove: ## Remove Docker container
	@echo "Removing Docker container..."
	docker rm $(DOCKER_CONTAINER_NAME) || true

.PHONY: docker-restart
docker-restart: docker-stop docker-remove docker-run-detached ## Restart Docker container

.PHONY: docker-logs
docker-logs: ## Show Docker container logs
	@echo "Showing Docker container logs..."
	docker logs $(DOCKER_CONTAINER_NAME)

.PHONY: docker-logs-follow
docker-logs-follow: ## Follow Docker container logs
	@echo "Following Docker container logs..."
	docker logs -f $(DOCKER_CONTAINER_NAME)

.PHONY: docker-clean
docker-clean: ## Clean up Docker containers and images
	@echo "Cleaning up Docker containers and images..."
	docker stop $(DOCKER_CONTAINER_NAME) || true
	docker rm $(DOCKER_CONTAINER_NAME) || true
	docker rmi $(DOCKER_IMAGE_NAME) || true

# SSL Certificate generation (if needed)
.PHONY: generate-certs
generate-certs: ## Generate SSL certificates
	@echo "Generating SSL certificates..."
	chmod +x generate_certificates.sh
	./generate_certificates.sh

# Environment setup
.PHONY: setup-env
setup-env: ## Setup environment file template
	@echo "Setting up environment file template..."
	@if [ ! -f .env ]; then \
		echo "REACT_APP_API_URL=http://localhost:3001" > .env; \
		echo "REACT_APP_WEBCAM_TIMEOUT=10000" >> .env; \
		echo "REACT_APP_CAPTURE_INTERVAL=2000" >> .env; \
		echo "Environment file created: .env"; \
	else \
		echo "Environment file already exists: .env"; \
	fi

# Complete setup commands
.PHONY: setup
setup: setup-env install ## Complete project setup
	@echo "Project setup completed!"
	@echo "You can now run 'make start' to start the development server"

.PHONY: setup-docker
setup-docker: setup-env docker-build ## Setup for Docker deployment
	@echo "Docker setup completed!"
	@echo "You can now run 'make docker-run' or 'make docker-run-detached'"

# Production deployment
.PHONY: deploy
deploy: build docker-build docker-restart ## Build and deploy with Docker
	@echo "Deployment completed!"
	@echo "Application is running at:"
	@echo "  HTTPS: https://127.0.0.1"
	@echo "  HTTP:  http://127.0.0.1"

# Cleanup commands
.PHONY: clean
clean: ## Clean build artifacts and node_modules
	@echo "Cleaning build artifacts..."
	rm -rf build/
	rm -rf node_modules/
	rm -rf .npm/

.PHONY: clean-all
clean-all: clean docker-clean ## Clean everything including Docker artifacts
	@echo "Full cleanup completed!"

# Status commands
.PHONY: status
status: ## Show application status
	@echo "=== Application Status ==="
	@echo "Docker container status:"
	@docker ps -a --filter name=$(DOCKER_CONTAINER_NAME) --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No container found"
	@echo ""
	@echo "Docker image status:"
	@docker images $(DOCKER_IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" || echo "No image found"

.PHONY: check-requirements
check-requirements: ## Check if all requirements are installed
	@echo "Checking requirements..."
	@node --version || echo "❌ Node.js not found"
	@npm --version || echo "❌ npm not found"
	@docker --version || echo "❌ Docker not found"
	@echo "✅ Requirements check completed"

# Development utilities
.PHONY: dev
dev: install start ## Quick development setup and start

.PHONY: prod
prod: build docker-build docker-run-detached status ## Quick production setup

# Default target when no argument is provided
.DEFAULT_GOAL := help
