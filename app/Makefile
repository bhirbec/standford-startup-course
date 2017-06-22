SHELL=/bin/bash

.PHONY: install postinstall clear js

install: postinstall
	npm install

# node_modules/.rebuild is touched by node_modules/.hooks/postinstall everytime
# `npm install` runs. This improves performance of this rule since make only
# compares one mtime.
postinstall:
	mkdir -p node_modules/.hooks
	echo touch $(CURDIR)/node_modules/.rebuild > node_modules/.hooks/postinstall
	chmod +x node_modules/.hooks/postinstall

js: static/build/index.js static/build/lib.js

clear:
	rm -rf static/build

static/build/index.js: $(shell find client -name "*.js")
	mkdir -p static/build
	node_modules/browserify/bin/cmd.js  \
		-t [ babelify --presets [ es2015 react ] ] \
		-x react \
		-x react-dom \
		-x react-router \
		-x react-router-dom \
		-x react-select \
		client/index.js > $@

static/build/lib.js: node_modules/.rebuild
	mkdir -p static/build
	node_modules/browserify/bin/cmd.js \
		-r react \
		-r react-dom \
		-r react-router \
		-r react-router-dom \
		-r react-select \
		-o $@
