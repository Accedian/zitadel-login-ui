DOCKER_REPO_NAME := gcr.io/npav-172917/zitadel-login-ui
CONTAINER_REGISTRY := zitadel-login-ui
# DOCKERFILE_TARGET := docker/Dockerfile.zitadel-login-ui
DOCKERFILE_TARGET := docker/Dockerfile


PWD := $(shell pwd)

# UNAME := $(shell uname -m)
LOCAL_BUILD_PLATFORM := linux/amd64
# ifeq ($(UNAME),arm64)
# 	LOCAL_BUILD_PLATFORM = linux/arm64/v8
# endif
# BUILD_PLATFORMS ?= linux/amd64,linux/arm64/v8
BUILD_PLATFORMS ?= linux/amd64

HELM_SEMVER_PATTERN := ^[0-9]+\.[0-9]+\.[0-9]+
HELM_VER ?= $(shell if echo "$(DOCKER_VER)" | grep -Eq '$(HELM_SEMVER_PATTERN)'; then echo "$(DOCKER_VER)"; else echo "0.0.0-$(DOCKER_VER)"; fi)
HELM_REPO := oci://us-docker.pkg.dev/npav-172917/helm-package/$(CONTAINER_REGISTRY)

dockerbin: .FORCE
# --progress=plain --no-cache 
docker: dockerbin
	echo "building with $(LOCAL_BUILD_PLATFORM)"
	docker buildx build --platform $(LOCAL_BUILD_PLATFORM) -t $(DOCKER_REPO_NAME):$(DOCKER_VER)  .

push: dockerbin
	echo "building with $(BUILD_PLATFORMS)"
	docker buildx build --platform $(BUILD_PLATFORMS) -t $(DOCKER_REPO_NAME):$(DOCKER_VER) --push .

circleci-push:
	echo "building with $(BUILD_PLATFORMS)"
	docker buildx build --platform $(BUILD_PLATFORMS) -t $(DOCKER_REPO_NAME):$(DOCKER_VER) --push .

# circleci-docker:
# 	echo "building with $(BUILD_PLATFORMS)"
# 	docker buildx build --platform $(LOCAL_BUILD_PLATFORM) -t $(DOCKER_REPO_NAME)$(CONTAINER_REGISTRY):$(DOCKER_VER) --load --file $(DOCKERFILE_TARGET) --progress=plain --no-cache .

# circleci-push-latest:
# 	echo "building and pushing latest with $(BUILD_PLATFORMS)"
# 	docker buildx build --platform $(BUILD_PLATFORMS) -t $(DOCKER_REPO_NAME)$(CONTAINER_REGISTRY):latest --file $(DOCKERFILE_TARGET) --push .

.PHONY: helm-and-push
helm-and-push $(CONTAINER_REGISTRY)-$(HELM_VER).tgz:
	@echo "For service '$(CONTAINER_REGISTRY)' using 'version: $(HELM_VER)' and 'appVersion: $(DOCKER_VER)'"
	sed -i -e "s/^version:.*$$/version: $(HELM_VER)/" -e "s/^appVersion:.*$$/appVersion: $(DOCKER_VER)/" helm/$(CONTAINER_REGISTRY)/Chart.yaml
	sed -i -e "s/tag:.*$$/tag: $(DOCKER_VER)/" helm/$(CONTAINER_REGISTRY)/values.yaml
	helm lint helm/$(CONTAINER_REGISTRY)
	helm package helm/$(CONTAINER_REGISTRY)
  helm push $< $(HELM_REPO)

helm-push: $(CONTAINER_REGISTRY)-$(HELM_VER).tgz
	helm push $< $(HELM_REPO)

# .PHONY: helm helm-push
# helm $(CONTAINER_REGISTRY)-$(HELM_VER).tgz:
# 	@echo "For service '$(CONTAINER_REGISTRY)' using 'version: $(HELM_VER)' and 'appVersion: $(DOCKER_VER)'"
# 	sed -i -e "s/^version:.*$$/version: $(HELM_VER)/" -e "s/^appVersion:.*$$/appVersion: $(DOCKER_VER)/" helm/$(CONTAINER_REGISTRY)/Chart.yaml
# 	sed -i -e "s/tag:.*$$/tag: $(DOCKER_VER)/" helm/$(CONTAINER_REGISTRY)/values.yaml
# 	helm lint helm
# 	helm package helm

# helm-push: $(CONTAINER_REGISTRY)-$(HELM_VER).tgz
# 	helm push $< $(HELM_REPO)

.FORCE:
clean:
	rm -rf $(POST_BUILD_CLEANUP_DIR)

# Make commands for targets in monorepo to reduce number of arguments
