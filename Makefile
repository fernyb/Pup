install:
	npm install
	node node_modules/puppeteer/install.js

build:
	docker build -t pup .

run:
	docker run -i -t pup
