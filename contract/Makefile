all : build deploy 
.PHONY : all

build: scripts/build.sh src/pokerchndadv.cpp
	./scripts/build.sh

deploy: scripts/deploy.sh
	./scripts/deploy.sh

test: scripts/test.sh
	./scripts/test.sh
