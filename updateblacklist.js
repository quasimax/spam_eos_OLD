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

async function getUsers() {
    let users = new Set();
    let result = await db.sequelize.query(`SELECT * FROM users where username NOT IN
    (SELECT username FROM blacklist);`,
        {type: db.sequelize.QueryTypes.SELECT});
    result.forEach(user => {
        users.add(user.username);
    });
    return Array.from(users);
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
    let users = await getUsers();

    for (let i = 0; i < users.length; i++) {
        let username = users[i];

        let ok = await checkIfContract(username);

        if (ok) {
            console.log("Account " + username + " is a contract");
            await db.Blacklist.findOrCreate({
                where: {username: username},
                defaults: {
                    username: username,
                    isContract: true,
                    reason: "contract"
                }
            })
        }
    }
}

main();
