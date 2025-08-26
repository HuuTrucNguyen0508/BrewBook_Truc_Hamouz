#!/bin/bash

# BrewBook Docker Deployment Script
# This script helps you deploy and manage your BrewBook application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Docker Hub configuration
DOCKER_HUB_USERNAME="huutrucnguyen0508"
DOCKER_HUB_REPOSITORY="brewbook"
DOCKER_HUB_IMAGE="${DOCKER_HUB_USERNAME}/${DOCKER_HUB_REPOSITORY}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found!"
        print_status "Please copy env.example to .env and fill in your values:"
        echo "cp env.example .env"
        echo "nano .env  # or your preferred editor"
        exit 1
    fi
    print_success ".env file found"
}

# Build the Docker image
build() {
    local tag=${1:-latest}
    print_status "Building BrewBook Docker image with tag: $tag..."
    docker build -t ${DOCKER_HUB_IMAGE}:${tag} .
    print_success "Docker image built successfully: ${DOCKER_HUB_IMAGE}:${tag}"
}

# Build and tag for multiple versions
build_versions() {
    print_status "Building BrewBook Docker images for multiple versions..."
    
    # Build latest
    build "latest"
    
    # Build versioned tags
    local version=$(date +%Y%m%d)
    build "$version"
    
    # Build with git commit hash if available
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        local commit_hash=$(git rev-parse --short HEAD)
        build "$commit_hash"
        print_success "Built images: latest, $version, $commit_hash"
    else
        print_success "Built images: latest, $version"
    fi
}

# Login to Docker Hub
docker_login() {
    print_status "Logging in to Docker Hub..."
    if docker login -u "$DOCKER_HUB_USERNAME"; then
        print_success "Successfully logged in to Docker Hub"
    else
        print_error "Failed to login to Docker Hub"
        exit 1
    fi
}

# Push image to Docker Hub
push() {
    local tag=${1:-latest}
    print_status "Pushing ${DOCKER_HUB_IMAGE}:${tag} to Docker Hub..."
    
    if docker push "${DOCKER_HUB_IMAGE}:${tag}"; then
        print_success "Successfully pushed ${DOCKER_HUB_IMAGE}:${tag} to Docker Hub"
    else
        print_error "Failed to push ${DOCKER_HUB_IMAGE}:${tag} to Docker Hub"
        exit 1
    fi
}

# Push all versions to Docker Hub
push_all() {
    print_status "Pushing all BrewBook Docker images to Docker Hub..."
    
    # Login first
    docker_login
    
    # Push latest
    push "latest"
    
    # Push versioned tags
    local version=$(date +%Y%m%d)
    push "$version"
    
    # Push with git commit hash if available
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        local commit_hash=$(git rev-parse --short HEAD)
        push "$commit_hash"
        print_success "Pushed all images: latest, $version, $commit_hash"
    else
        print_success "Pushed all images: latest, $version"
    fi
}

# Build and push in one command
build_and_push() {
    local tag=${1:-latest}
    print_status "Building and pushing BrewBook Docker image..."
    
    # Build the image
    build "$tag"
    
    # Login to Docker Hub
    docker_login
    
    # Push the image
    push "$tag"
    
    print_success "Successfully built and pushed ${DOCKER_HUB_IMAGE}:${tag}"
}

# Build and push all versions
build_and_push_all() {
    print_status "Building and pushing all BrewBook Docker images..."
    
    # Build all versions
    build_versions
    
    # Push all versions
    push_all
    
    print_success "Successfully built and pushed all images to Docker Hub"
}

# Start all services
start() {
    print_status "Starting BrewBook services..."
    docker-compose up -d
    print_success "Services started successfully"
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_health
}

# Stop all services
stop() {
    print_status "Stopping BrewBook services..."
    docker-compose down
    print_success "Services stopped successfully"
}

# Restart all services
restart() {
    print_status "Restarting BrewBook services..."
    docker-compose restart
    print_success "Services restarted successfully"
}

# Show service logs
logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for service: $1"
        docker-compose logs -f "$1"
    fi
}

# Show service status
status() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check if main app is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "BrewBook app is healthy"
    else
        print_warning "BrewBook app health check failed"
    fi
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL database is healthy"
    else
        print_warning "PostgreSQL database health check failed"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_warning "Redis health check failed"
    fi
}

# Clean up containers and volumes
cleanup() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Update services
update() {
    print_status "Pulling latest images and updating services..."
    docker-compose pull
    docker-compose up -d
    print_success "Services updated successfully"
}

# Show Docker Hub image info
hub_info() {
    print_status "Docker Hub Repository Information:"
    echo "Username: $DOCKER_HUB_USERNAME"
    echo "Repository: $DOCKER_HUB_REPOSITORY"
    echo "Full Image: $DOCKER_HUB_IMAGE"
    echo ""
    print_status "Available commands:"
    echo "  $0 build [tag]           # Build image with optional tag"
    echo "  $0 build-versions        # Build multiple versioned images"
    echo "  $0 push [tag]            # Push image with optional tag"
    echo "  $0 push-all              # Push all versioned images"
    echo "  $0 build-and-push [tag]  # Build and push in one command"
    echo "  $0 build-and-push-all    # Build and push all versions"
}

# Show help
show_help() {
    echo "BrewBook Docker Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build [tag]           Build the Docker image (default: latest)"
    echo "  build-versions        Build multiple versioned images"
    echo "  push [tag]            Push image to Docker Hub (default: latest)"
    echo "  push-all              Push all versioned images to Docker Hub"
    echo "  build-and-push [tag]  Build and push image in one command"
    echo "  build-and-push-all    Build and push all versions to Docker Hub"
    echo "  hub-info              Show Docker Hub repository information"
    echo ""
    echo "  start                 Start all services"
    echo "  stop                  Stop all services"
    echo "  restart               Restart all services"
    echo "  logs [service]        Show service logs"
    echo "  status                Show service status and resource usage"
    echo "  health                Check service health"
    echo "  update                Update services with latest images"
    echo "  cleanup               Remove all containers, networks, and volumes"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build v1.0.0       # Build image with tag v1.0.0"
    echo "  $0 push v1.0.0        # Push v1.0.0 to Docker Hub"
    echo "  $0 build-and-push     # Build and push latest"
    echo "  $0 start              # Start all services"
    echo "  $0 logs brewbook      # Show logs for brewbook service"
}

# Main script logic
case "${1:-help}" in
    build)
        build "$2"
        ;;
    build-versions)
        build_versions
        ;;
    push)
        push "$2"
        ;;
    push-all)
        push_all
        ;;
    build-and-push)
        build_and_push "$2"
        ;;
    build-and-push-all)
        build_and_push_all
        ;;
    hub-info)
        hub_info
        ;;
    start)
        check_env
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    health)
        check_health
        ;;
    update)
        update
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
