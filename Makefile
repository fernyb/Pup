CURRENT_BRANCH := $(shell git branch | sed -n -e 's/^\* \(.*\)/\1/p')
CURRENT_DIR := $(shell pwd)

.PHONY: clean
	install 
	login 
	run 
	docker_rm_image
	build
	create
	test
	stop_container

#
# Install npm dependencies
# Usage:
# make install
#
install:
	npm install
	node node_modules/puppeteer/install.js

#
# Build the image
# Usage:
# make build_image:
build_image:
	docker build -t pup:$(CURRENT_BRANCH) -f Dockerfile .
	docker image ls | grep pup | grep '$(CURRENT_BRANCH)' | awk '{ print $$3 }' | xargs echo $$1 > build_image
	docker image ls

build: build_image


# Start the container
start_container: build_image
	docker run --rm -d -it \
	-v $(CURRENT_DIR)/test:/pup/test \
	-v $(CURRENT_DIR)/lib:/pup/lib \
	 $$(cat create_container_name) > start_container
	 rm stop_container
	@echo ""
	docker container ls
	@echo ""

#
# Stop the container and it deletes itself
# usage:
# make stop_container
#
stop_container:
	if [ -f start_container ]; \
	then \
	docker container ls; \
	echo ""; \
	docker container stop $$(cat start_container); \
	cat start_container > stop_container; \
	echo ""; \
	docker container ls; \
	rm start_container; \
	echo ""; \
	fi;

#
# Log into the container
# Usage:
# make login
#
login: start_container
	docker exec -it $$(cat start_container) /bin/bash

#
# Run a single test within the container
# Usage:
# make run file=test/alert.test.js
#
run: start_container
	docker exec -it $$(cat start_container) /pup/run_test.sh $(file)

docker_rm_image: stop_container
	if [ -f build_image ]; \
	then \
	docker image ls | grep "$$(cat build_image)" | awk '{ print $$3 }' | xargs docker image rm $$1; \
	rm build_image; \
	docker image ls; \
	fi;

clean: stop_container docker_rm_image
	@echo ""
	@echo "Clean done..."
	@echo ""