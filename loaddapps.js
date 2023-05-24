const axios = require('axios');
const db = require("./models");
const env = process.env.NODE_ENV || 'jungle';

const ENDPOINT = "https://dappradar.com/api";

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getDappListByIndex(index) {
    try {
        const response = await axios.get(ENDPOINT + "/xchain/dapps/list/" + index);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function getDappInfo(protocol, id) {
    try {
        const response = await axios.get(ENDPOINT + `/${protocol}/dapp/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(error);
    }
}

async function getDappList(category, protocol, number) {
    let dapps = [];
    let index = 0;
    while (dapps.length < number) {
        let res = await getDappListByIndex(index++);

        if (!res.data.list) break;
        let list = res.data.list.filter((x) => x.category === category && x.protocols.indexOf("eos") != -1);
        dapps = dapps.concat(list)
    }

    return dapps.slice(0, number);
}

async function checkDapp(id) {
    let result = await db.Dapp.findOne({where: {id}});
    return !!result;
}

async function main() {
    let dapps = await getDappList("gambling", "eos", 500);

    for (let i = 0; i < dapps.length; i++) {
        if (await checkDapp(dapps[i].id)) continue;

        let res = await getDappInfo("eos", dapps[i].id);

        let [dapp, created] = await db.Dapp.findOrCreate({
            where: {id: res.info.id},
            defaults: {
                id: res.info.id,
                title: res.info.title,
                slug: res.info.slug,
                data: res
            }
        });

        console.log("New Dapp:", dapp.title, created);

    }
}

async function mainJungle() {

    let [dapp, created] = await db.Dapp.findOrCreate({
        where: {id: 1},
        defaults: {
            id: 1,
            title: "Pocker Chained",
            slug: "pokerchained",
            type: "POKER",
            data: {
                info: {
                    title: "Poker Chained",
                    dauLastDay: 1
                }, contracts: [
                    {address: "pokerchained"},
                    {address: "dcdpcontract"},
                ]
            }
        }
    });
}

if (env === "jungle") {
    mainJungle();

} else if (env === "mainnet") {
    main();
}
