SHELL=/bin/bash

.PHONY: install build deploy deploy-functions

install:
	cd app && make install
	rm -rf functions/node_modules
	cp -r app/package.json functions/package.json
	cd functions && npm install
	cd functions && npm install --save firebase-functions

build:
	cd app && make js
	rm -rf functions/app
	cp -r app functions/app

deploy: build
	./app/node_modules/babel-cli/bin/babel.js app/client --presets=es2015,react --out-dir functions/app/client
	./app/node_modules/babel-cli/bin/babel.js app/server --presets=es2015,react --out-dir functions/app/server
	firebase deploy

deploy-functions: build
	./app/node_modules/babel-cli/bin/babel.js app/server --presets=es2015,react --out-dir functions/app/server
	firebase deploy --only functions

deploy-hosting: build
	./app/node_modules/babel-cli/bin/babel.js app/client --presets=es2015,react --out-dir functions/app/client
	firebase deploy --only hosting
