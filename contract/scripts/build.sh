#!/bin/bash

set -e
set -x

eosio-cpp -o pokerchndadv.wasm ./src/pokerchndadv.cpp --abigen
