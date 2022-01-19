build: src/*
	tsc -p tsconfig.json

install:
	npm install -g .

clean: out/*
	rm out/*
