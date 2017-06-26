SHELL=/bin/bash

.PHONY: deploy

deploy:
	cd app && make install
	cd app && make js
	rm -rf functions/app
	rm -rf functions/node_modules
	cp -r app functions/app
	cp -r app/package.json functions/package.json
	cd functions && npm install
	cd functions && npm install --save firebase-functions
	./app/node_modules/babel-cli/bin/babel.js app/client --presets=es2015,react --out-dir functions/app/client
	firebase deploy
