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
	./app/node_modules/babel-cli/bin/babel.js app/mailer --presets=es2015,react --out-dir functions/app/mailer
	./app/node_modules/babel-cli/bin/babel.js app/search --presets=es2015,react --out-dir functions/app/search
	./app/node_modules/babel-cli/bin/babel.js app/server --presets=es2015,react --out-dir functions/app/server
	./app/node_modules/babel-cli/bin/babel.js app/liker --presets=es2015,react --out-dir functions/app/liker
	firebase deploy
