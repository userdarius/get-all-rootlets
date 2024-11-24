"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryNFTObjects = void 0;
exports.queryNFTObjects = "query($first: Int!, $after: String, $type: String!) {\n  objects(\n    first: $first\n    after: $after\n    filter: {type: $type}\n  ) {\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    nodes {\n      owner {\n        __typename\n        ... on AddressOwner {\n          owner {\n            address\n          }\n        }\n      }\n      asMoveObject {\n        contents {\n          json\n        }\n      }\n    }\n  }\n}";
