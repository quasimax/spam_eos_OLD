#!/bin/bash

set -e
set -x

cleos wallet unlock --password "PW5K5cqJhyt8xSDBBpjQZxw9wNFYjSEye3szHPeSXvkkdu1vacKMZ" || true

contract=$(env LC_ALL=C tr -dc 'a-z1-5' < /dev/urandom | head -c12)
newkey=$(cleos wallet create_key | sed -E 's@.*"(EOS.+)"@\1@')
cleos create account eosio $contract $newkey $newkey

echo "Contract: ${contract}"

cleos set contract $contract . -p $contract@active

env LC_CTYPE=C
MESSAGE=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 1024000 | head -n 1)

cleos push action $contract test "[\"${MESSAGE}\"]" -p $contract@active
