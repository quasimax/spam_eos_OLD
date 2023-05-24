#!/bin/bash

endpoint=https://dappradar.com/api/xchain/dapps
dapps_number=0

for ((i=0;i<100;i++)); do
    # get data from dappradar
    curl -s https://dappradar.com/api/xchain/dapps/list/$i > data/list-$i.json

    # process data
    dapps=$(cat list-$i.json | jq -c '.data.list[] | select(.protocols[] | contains("eos")) | select(.category == "gambling")' | jq --slurp '.' | jq 'sort_by(.rankings.category)' | jq '[limit(50;.[])]' | jq '.[].id')

    for i in dapps; do
        curl -s https://dappradar.com/api/xchain/dapps/list/$i > data/dapp-$i.json

        dapp_data=$()
    done
done


#https://dappradar.com/api/xchain/dapps/list/0
# https://dappradar.com/api/xchain/dapp/featured
curl -s https://dappradar.com/api/xchain/dapps/theRest

# https://dappradar.com/api/eos/dapp/883
