build: src/*
	tsc -p tsconfig.json

clean: out/*
	rm out/*
