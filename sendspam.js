const db = require("./models");
const Op = db.Sequelize.Op;
const env = process.env.NODE_ENV || 'jungle';
const config = require(__dirname + '/config/config.json')[env];

const eos = require("./eos");

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

async function main() {
    let users = await getUsers();

    let msgs = [];

    for (let i = 0; i < users.length; i++) {
        let username = users[i];

        let [msg, created] = await db.Queue.findOrCreate({
            where: {username: username},
            defaults: {
                username: username,
                status: "PENDING"
            }
        });

        if (msg.status === "PENDING") msgs.push(msg);
    }

    let pkgSize = 10;
    while (msgs.length > 0) {
        let pkgMsgs = msgs.splice(0, pkgSize);

        let users = [];
        pkgMsgs.forEach(msg => {
            users.push(msg.username)
        });

        console.log(`Sending to ${users}`);

        let result = await eos.transfer(users, "100.0000 PKDAD", config.message);

        console.log(JSON.stringify(result));

        for (let i = 0; i < pkgMsgs.length; i++) {
            let msg = pkgMsgs[i];

            if (result.error) {
                await msg.update({
                    status: "ERROR",
                    error: JSON.toString(result.error)
                });
            } else {
                await msg.update({
                    status: "DONE",
                    reciept: result
                });
            }
        }
    }
}

main();
