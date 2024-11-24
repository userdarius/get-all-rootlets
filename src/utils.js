"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.readFile = exports.graphQLClient = exports.parseSuiPlayRegistry = exports.sleep = exports.rpcClient = exports.suiFullNodeUrl = exports.log = void 0;
var client_1 = require("@mysten/sui/client");
var graphql_1 = require("@mysten/sui/graphql");
var util_1 = require("util");
var ramda_1 = require("ramda");
var fs = require("fs");
var log = function (x) { return console.log(util_1.default.inspect(x, false, null, true)); };
exports.log = log;
exports.suiFullNodeUrl = process.env.SUI_FULL_NODE_URL || (0, client_1.getFullnodeUrl)('mainnet');
exports.rpcClient = new client_1.SuiClient({
    url: exports.suiFullNodeUrl,
});
var sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
exports.sleep = sleep;
var parseSuiPlayRegistry = function (obj) {
    return {
        objectId: (0, ramda_1.pathOr)('', ['data', 'objectId'], obj),
        type: (0, ramda_1.pathOr)('', ['data', 'content', 'type'], obj),
        version: (0, ramda_1.pathOr)('', ['data', 'version'], obj),
        exaltedMinted: (0, ramda_1.pathOr)('', ['data', 'content', 'fields', 'exalted_minted'], obj),
        mythicsMinted: (0, ramda_1.pathOr)('', ['data', 'content', 'fields', 'mythics_minted'], obj),
    };
};
exports.parseSuiPlayRegistry = parseSuiPlayRegistry;
exports.graphQLClient = new graphql_1.SuiGraphQLClient({
    url: 'https://sui-mainnet.mystenlabs.com/graphql',
});
exports.readFile = util_1.default.promisify(fs.readFile);
exports.writeFile = util_1.default.promisify(fs.writeFile);
