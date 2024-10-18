import {
  SUI_PLAY_NFT_PRE_ORDER_NFT_TYPE,
  SUI_PLAY_PRE_ORDER_REGISTRY_OBJECT_ID,
} from './constants';

import { rpcClient, log, parseSuiPlayRegistry, graphQLClient } from './utils';

import { queryNFTObjects } from './query';
import { pathOr } from 'ramda';

export const getSuiPlayNftRegistry = async () => {
  const obj = await rpcClient.getObject({
    id: SUI_PLAY_PRE_ORDER_REGISTRY_OBJECT_ID,
    options: {
      showContent: true,
    },
  });

  return parseSuiPlayRegistry(obj);
};

interface GetNFTObjectsArgs {
  objectType: string;
  after: string | null;
  first: number;
}

export const getNFTObjects = async ({
  objectType,
  after,
  first,
}: GetNFTObjectsArgs) => {
  const result = await graphQLClient.query({
    query: queryNFTObjects,
    variables: { type: objectType, first, after },
  });

  return {
    pageInfo: {
      endCursor: pathOr(
        '',
        ['data', 'objects', 'pageInfo', 'endCursor'],
        result
      ),
      hasNextPage: pathOr(
        false,
        ['data', 'objects', 'pageInfo', 'hasNextPage'],
        result
      ),
    },
    nfts: pathOr([], ['data', 'objects', 'nodes'], result).map((node) => ({
      owner: pathOr('', ['owner', 'owner', 'address'], node),
      content: pathOr('', ['asMoveObject', 'contents', 'json'], node),
    })),
  };
};

(async () => {
  const registry = await getSuiPlayNftRegistry();
  log(registry);

  let after = null;
  let results = [];
  let objects = await getNFTObjects({
    objectType: SUI_PLAY_NFT_PRE_ORDER_NFT_TYPE,
    after,
    first: 50,
  });

  results.push(...objects.nfts);
  after = objects.pageInfo.endCursor;

  while (after) {
    objects = await getNFTObjects({
      objectType: SUI_PLAY_NFT_PRE_ORDER_NFT_TYPE,
      after,
      first: 50,
    });

    results.push(...objects.nfts);
    after = objects.pageInfo.endCursor;
  }

  log(results.length);
})();
