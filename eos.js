// EOS part
const {Api, JsonRpc, RpcError, Serialize} = require("eosjs");
const {JsSignatureProvider} = require("eosjs/dist/eosjs-jssig");
const fetch = require("node-fetch");
const {TextEncoder, TextDecoder} = require("util");
const ecc = require("eosjs-ecc");

const env = process.env.NODE_ENV || 'jungle';
const config = require(__dirname + '/config/config.json')[env];


let keys = [];

for (let account in config.accounts) {
    if (config.accounts.hasOwnProperty(account)) {
        keys.push(config.accounts[account].key)
    }
}

const signatureProvider = new JsSignatureProvider(keys);

const rpc = new JsonRpc(config.api, {fetch});

const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});

const contract = config.accounts["contract"].name;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class EOS {

    async deploy(wasm, abi) {
        const buffer = new Serialize.SerialBuffer({
            textEncoder: api.textEncoder,
            textDecoder: api.textDecoder,
        });

        const abiDefinition = api.abiTypes.get(`abi_def`);
        // need to make sure abi has every field in abiDefinition.fields
        // otherwise serialize throws
        abi = abiDefinition.fields.reduce(
            (acc, {name: fieldName}) =>
                Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
            abi
        );
        abiDefinition.serialize(buffer, abi);

        await this.sendActions([
            {
                account: "eosio",
                name: "setcode",
                authorization: [
                    {
                        actor: contract,
                        permission: "active",
                    },
                ],
                data: {
                    account: contract,
                    vmtype: 0,
                    vmversion: 0,
                    code: wasm,
                },
            },
            {
                account: "eosio",
                name: "setabi",
                authorization: [
                    {
                        actor: contract,
                        permission: "active",
                    },
                ],
                data: {
                    account: contract,
                    abi: Buffer.from(buffer.asUint8Array()).toString(`hex`),
                },
            }
        ])
    }

    async init() {

        await this.sendActions([
            {
                account: contract,
                name: "init",
                authorization: [
                    {
                        actor: contract,
                        permission: "active",
                    },
                ],
                data: {
                    wallet: contract
                },
            }
        ])
    }

    async transfer(users, amount, memo) {
        let actions = [];

        users.forEach(to => {
            actions.push({
                account: contract,
                name: 'transfer',
                authorization: [{
                    actor: contract,
                    permission: 'active',
                }],
                data: {
                    from: contract,
                    to: to,
                    quantity: amount,
                    memo: memo,
                }
            });
        });

        return await this.sendActions(actions);
    }

    async sendActions(actions) {

        try {
            const result = await api.transact({
                actions
            }, {
                blocksBehind: 1,
                expireSeconds: 3600,
            });
            // console.dir(result);
            //console.log(result);
            return result;
        } catch (e) {
            console.log("\nCaught exception: " + e);
            if (e instanceof RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            return {error: e}
        }
    };


}

module.exports = new EOS();
