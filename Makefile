build: src/*
	tsc -p tsconfig.json

install: build
	sudo npm install -g . --force

clean: out/*
	rm out/*
