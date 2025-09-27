# vars
REGION=us-central1
PROJECT=startupevaluator-472213
REPO=cloud-run-source-deploy
IMAGE=ai-analyst-backend-service
TAG=latest
FULL_IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${IMAGE}:${TAG}"

# configure docker auth to Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# build & push
docker build -t ${FULL_IMAGE} .
docker push ${FULL_IMAGE}
