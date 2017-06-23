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
	firebase deploy
