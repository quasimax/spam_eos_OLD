const eos = require("./eos");
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

function getDeployableDataFromDir(dir) {
    const dirCont = fs.readdirSync(dir);
    const wasmFileName = dirCont.find(filePath => filePath.match(/.*\.(wasm)$/gi));
    const abiFileName = dirCont.find(filePath => filePath.match(/.*\.(abi)$/gi));
    if (!wasmFileName) throw new Error(`Cannot find a ".wasm file" in ${dir}`);
    if (!abiFileName) throw new Error(`Cannot find an ".abi file" in ${dir}`);

    const wasmPath = path.join(dir, wasmFileName);
    const abiPath = path.join(dir, abiFileName);

    const wasm = fs.readFileSync(wasmPath).toString(`hex`);
    const abi = JSON.parse(fs.readFileSync(abiPath, `utf8`));

    return {wasm, abi}
}

const main = async function () {
    const {wasm, abi} = getDeployableDataFromDir("contract");
    await eos.deploy(wasm, abi);
    await eos.init();
};

main().then(() => {
    process.exit(0)
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
