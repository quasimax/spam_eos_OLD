#!/bin/bash

set -e
set -x

cleos wallet unlock --password "PW5K5cqJhyt8xSDBBpjQZxw9wNFYjSEye3szHPeSXvkkdu1vacKMZ" || true

cleos set contract pokerchndadv . -p pokerchndadv@active
