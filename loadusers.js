const axios = require('axios');
const db = require("./models");
const env = process.env.NODE_ENV || 'jungle';
const config = require(__dirname + '/config/config.json')[env];

const API = config.api;

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 7);
if (env === "jungle") {
    fromDate.setDate(fromDate.getDate() - 365);
}

async function getDappContracts(top = 500) {
    let dapps = await db.sequelize.query(`select id, data from dapps where type = 'POKER'
    order by json_extract(data, '$.info.dauLastDay') DESC limit ${top};`,
        {type: db.sequelize.QueryTypes.SELECT});

    let contracts = [];
    dapps.forEach(d => {
        contracts.push({
            id: d.id,
            contracts: JSON.parse(d.data).contracts.map(x => x.address)
        });
    });
    return contracts;
}

async function getUsers(contract) {
    let result = await db.User.findAll({where: {
        contract: contract
    }});
    let users = [];
    result.forEach(user => {
        users.push(user.username);
    });
    return users;
}

async function updateUser(dappId, contract, username, actedAt) {
    //console.log("updateUser", dappId, contract, username, actedAt);
    let [record, created] = await db.User.findOrCreate({
        where: {
            dappId: dappId,
            contract: contract,
            username: username
        }, defaults: {
            dappId: dappId,
            contract: contract,
            username: username,
            actedAt: actedAt
        }
    });

    if (!created) {
        if (record.actedAt < actedAt)
            await record.update({actedAt: actedAt});
    }
}

async function getActions(contract, number) {
    let pos = -1;
    let offset = -1000;
    let result = [];

    let retry = 1;
    while (result.length < number || pos === 0) {

        let response = null;

        try {
            response = await axios.post(API + "/v1/history/get_actions", {
                account_name: contract,
                pos: pos,
                offset: offset
            });
        } catch (e) {
            if (retry-- > 0) continue;
            else break;
        }

        let actions = response.data.actions.reverse();

        actions.forEach(act => {
            pos = act.account_action_seq;
            result.push(act);
        });

        if (actions.length <= 1) break;

        // break if action < one month ago
        let lastActionDate = new Date(actions[actions.length-1].action_trace.block_time);
        if (lastActionDate < fromDate) break;

        console.log(`get ${pos} : ${offset} (${result.length}, ${lastActionDate})`);
    }
    return result;
}

async function checkIfContract(username) {
    try {
        let response = await axios.post(API + "/v1/chain/get_raw_code_and_abi", {
            account_name: username
        });
        return !!response.data.wasm;
    } catch (e) {
        console.log(e);
        return false;
    }
}

async function main() {
    let dapps = await getDappContracts();

    for (let i = 0; i < dapps.length; i++) {
        console.log("DAPP:", i, "/", dapps.length);
        let dappId = dapps[i].id;
        for (let c = 0; c < dapps[i].contracts.length; c++) {
            let contract = dapps[i].contracts[c];
            let users = new Set();

            // let loadedUsers = await getUsers(contract);
            // if (loadedUsers.length > 0) {
            //     console.log("Contract:", contract, loadedUsers.length);
            //     continue;
            // }

            try {
                let actions = await getActions(contract, 10000);

                for (let j = 0; j < actions.length; j++) {
                    let action = actions[j];

                    let username = action.action_trace.act.authorization[0].actor;
                    let actedAt = new Date(action.action_trace.block_time);

                    users.add(username);

                    try {
                        await updateUser(dappId, contract, username, actedAt);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } catch (error) {
                console.log(error);
            }

            console.log("Contract:", contract, users.size);
        }
    }
}

main();
