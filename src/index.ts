import {
  ROOTLETS_TYPE,
} from './constants';

import {
  rpcClient,
  log,
  parseSuiPlayRegistry,
  graphQLClient,
  writeFile,
} from './utils';

import { queryNFTObjects } from './query';
import { pathOr } from 'ramda';
import fs from 'fs';
import path from 'path';

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

const writeToCsv = (filePath, data) => {
  const csvContent = data.map((item) => item.content.id).join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf8');
};

(async () => {

  let after = null;
  let results = [];
  let objects = await getNFTObjects({
    objectType: ROOTLETS_TYPE,
    after,
    first: 50,
  });

  results.push(...objects.nfts);
  after = objects.pageInfo.endCursor;

  while (after) {
    objects = await getNFTObjects({
      objectType: ROOTLETS_TYPE,
      after,
      first: 50,
    });

    log(objects.nfts);
    results.push(...objects.nfts);
    after = objects.pageInfo.endCursor;
  }

  log(`Total NFTs fetched: ${results.length}`);

  // Write the results to a JSON file
  const jsonFilePath = path.join(__dirname, '../data/rootlets-nfts.json');
  await writeFile(jsonFilePath, JSON.stringify(results, null, 2));

  // Extract IDs and write them to a CSV file
  const csvFilePath = path.join(__dirname, '../data/rootlets-nfts.csv');
  writeToCsv(csvFilePath, results);

  log(`Data written to JSON: ${jsonFilePath}`);
  log(`IDs written to CSV: ${csvFilePath}`);
})();
