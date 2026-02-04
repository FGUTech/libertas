.PHONY: dev build lint install

# Development server
dev:
	cd website && npm run dev

# Production build
build:
	cd website && npm run build

# Run linter
lint:
	cd website && npm run lint

# Install dependencies
install:
	cd website && npm install
