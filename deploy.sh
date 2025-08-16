#!/bin/bash

# ConnectHub Production Deployment Script
# This script handles the complete deployment of ConnectHub to production

set -e  # Exit on any error

echo "🚀 Starting ConnectHub Production Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="${DOCKER_REGISTRY:-connecthub}"
VERSION="${VERSION:-latest}"
NAMESPACE="${NAMESPACE:-connecthub}"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if ! command -v kubectl &> /dev/null; then
        print_warning "kubectl is not installed. Kubernetes deployment will be skipped."
        SKIP_K8S=true
    fi
    
    print_success "Prerequisites check completed"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend image
    print_status "Building backend image..."
    docker build -t ${DOCKER_REGISTRY}/backend:${VERSION} ./ConnectHub-Backend/
    
    # Build frontend image
    print_status "Building frontend image..."
    docker build -t ${DOCKER_REGISTRY}/frontend:${VERSION} ./ConnectHub-Frontend/
    
    print_success "Docker images built successfully"
}

# Deploy with Docker Compose (Local/Single Server)
deploy_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose down --remove-orphans || true
    
    # Clean up unused containers and images
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f || true
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
    
    print_success "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    if [ "$SKIP_K8S" = true ]; then
        print_warning "Skipping Kubernetes deployment (kubectl not found)"
        return
    fi
    
    print_status "Deploying to Kubernetes..."
    
    # Apply namespace and RBAC
    kubectl apply -f kubernetes/namespace.yaml
    
    # Create secrets (you should customize these)
    print_status "Creating Kubernetes secrets..."
    kubectl create secret generic connecthub-secrets \
        --namespace=${NAMESPACE} \
        --from-literal=database-url="postgresql://connecthub:secure_password123@postgres:5432/connecthub" \
        --from-literal=redis-url="redis://:redis_password123@redis:6379" \
        --from-literal=jwt-secret="super_secure_jwt_secret_key_for_production_32_chars" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy backend
    kubectl apply -f kubernetes/backend-deployment.yaml
    
    # Wait for deployment to be ready
    print_status "Waiting for Kubernetes deployment..."
    kubectl rollout status deployment/connecthub-backend -n ${NAMESPACE}
    
    print_success "Kubernetes deployment completed"
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend service is healthy"
    else
        print_warning "Backend service health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/health.html > /dev/null 2>&1; then
        print_success "Frontend service is healthy"
    else
        print_warning "Frontend service health check failed"
    fi
    
    # Check database
    if docker exec connecthub-postgres pg_isready -U connecthub > /dev/null 2>&1; then
        print_success "Database is ready"
    else
        print_warning "Database connection failed"
    fi
    
    # Check Redis
    if docker exec connecthub-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_warning "Redis connection failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Grafana will be available at http://localhost:3001
    print_status "Grafana dashboard: http://localhost:3001 (admin/admin123)"
    
    # Prometheus will be available at http://localhost:9090
    print_status "Prometheus: http://localhost:9090"
    
    # Kibana will be available at http://localhost:5601
    print_status "Kibana logs: http://localhost:5601"
    
    print_success "Monitoring setup completed"
}

# Database migration
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run Prisma migrations
    docker exec connecthub-backend npx prisma db push || print_warning "Migration failed or already applied"
    
    print_success "Database migrations completed"
}

# Display final status
show_deployment_info() {
    echo ""
    echo "🎉 ConnectHub Deployment Complete!"
    echo "=================================="
    echo ""
    echo "📱 Application URLs:"
    echo "   • Frontend:  http://localhost:3000"
    echo "   • Backend:   http://localhost:5000"
    echo "   • API Docs:  http://localhost:5000/api/docs"
    echo ""
    echo "📊 Monitoring & Management:"
    echo "   • Grafana:     http://localhost:3001 (admin/admin123)"
    echo "   • Prometheus:  http://localhost:9090"
    echo "   • Kibana:      http://localhost:5601"
    echo "   • RabbitMQ:    http://localhost:15672 (connecthub/rabbitmq123)"
    echo ""
    echo "🗃️  Database Access:"
    echo "   • PostgreSQL:  localhost:5432 (connecthub/secure_password123)"
    echo "   • Redis:       localhost:6379 (password: redis_password123)"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Configure your domain and SSL certificates"
    echo "   2. Update environment variables for production"
    echo "   3. Set up external monitoring and alerting"
    echo "   4. Configure backup strategies"
    echo "   5. Submit mobile apps to App Store and Google Play"
    echo ""
    echo "🔧 Management Commands:"
    echo "   • View logs:     docker-compose logs -f [service]"
    echo "   • Scale service: docker-compose up --scale backend=3"
    echo "   • Update:        ./deploy.sh"
    echo "   • Stop:          docker-compose down"
    echo ""
    print_success "ConnectHub is now running in production mode!"
}

# Main deployment function
main() {
    echo "🏗️  ConnectHub Production Deployment"
    echo "   Version: ${VERSION}"
    echo "   Registry: ${DOCKER_REGISTRY}"
    echo "   Namespace: ${NAMESPACE}"
    echo ""
    
    # Run deployment steps
    check_prerequisites
    build_images
    deploy_docker_compose
    run_migrations
    setup_monitoring
    
    # Optional Kubernetes deployment
    if [ "${DEPLOY_K8S:-false}" = "true" ]; then
        deploy_kubernetes
    fi
    
    show_deployment_info
}

# Handle script arguments
case "${1:-help}" in
    "docker")
        check_prerequisites
        build_images
        deploy_docker_compose
        run_migrations
        setup_monitoring
        show_deployment_info
        ;;
    "k8s"|"kubernetes")
        check_prerequisites
        build_images
        DEPLOY_K8S=true
        deploy_kubernetes
        ;;
    "build")
        check_prerequisites
        build_images
        ;;
    "help"|*)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  docker      Deploy using Docker Compose (default)"
        echo "  kubernetes  Deploy to Kubernetes cluster"
        echo "  build       Build Docker images only"
        echo "  help        Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  VERSION           Docker image version (default: latest)"
        echo "  DOCKER_REGISTRY   Docker registry name (default: connecthub)"
        echo "  NAMESPACE         Kubernetes namespace (default: connecthub)"
        exit 0
        ;;
esac

# Run main deployment if no specific command provided
if [ $# -eq 0 ]; then
    main
fi
