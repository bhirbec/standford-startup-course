SHELL=/bin/bash

.PHONY: install functions postinstall clear js

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
		-x algoliasearch \
		-x draft-js \
		-x material-ui/Avatar \
		-x material-ui/Dialog \
		-x material-ui/Drawer \
		-x material-ui/FloatingActionButton \
		-x material-ui/MenuItem \
		-x material-ui/Popover \
		-x material-ui/Snackbar \
		-x material-ui/styles/MuiThemeProvider \
		-x react \
		-x react-dom \
		-x react-router \
		-x react-router-dom \
		-x react-select \
		-x react-share \
		-x react-tap-event-plugin \
		-x universal-cookie \
		client/index.js > $@

static/build/lib.js: node_modules/.rebuild
	mkdir -p static/build
	node_modules/browserify/bin/cmd.js \
		-r algoliasearch \
		-r draft-js \
		-r material-ui/Avatar \
		-r material-ui/Dialog \
		-r material-ui/Drawer \
		-r material-ui/FloatingActionButton \
		-r material-ui/MenuItem \
		-r material-ui/Popover \
		-r material-ui/Snackbar \
		-r material-ui/styles/MuiThemeProvider \
		-r react \
		-r react-dom \
		-r react-router \
		-r react-router-dom \
		-r react-select \
		-r react-share \
		-r react-tap-event-plugin \
		-r universal-cookie \
		-o $@

app:
	./node_modules/babel-cli/bin/babel.js app --presets=es2015,react --out-dir ../functions/app
