import { SearchService } from 'azure-search-client';
import csvParse = require('csv-parse');
import { config } from 'dotenv';
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import * as map from 'through2-map';

import { BOOLEAN_FIELDS_IX, DROP_HEADERS_IX, HEADERS, JSON_MULTI_VALUE_HEADERS_IX, MULTI_VALUE_HEADERS, MULTI_VALUE_HEADERS_IX } from './headers';

config({ path: `${__dirname}/../.env` });

const SEARCH_SERVICE = process.env.SEARCH_SERVICE;
const SEARCH_KEY = process.env.SEARCH_KEY;
const DATA_FILE = '../data/MetArtworksAugmented.csv';

const search = new SearchService(SEARCH_SERVICE, SEARCH_KEY);

function normalizeDocument(doc: any) {
  Object.keys(doc).forEach((k) => {
    const value = doc[k];
    if (value && !MULTI_VALUE_HEADERS_IX[k] && value.includes('|')) {
      console.log('MULTI_VALUE', k);
      MULTI_VALUE_HEADERS_IX[k] = true;
    }
    if (DROP_HEADERS_IX[k]) {
      delete doc[k];
    } else if (MULTI_VALUE_HEADERS_IX[k]) {
      doc[k] = !!doc[k] ? doc[k].split('|').filter((x: string) => !!x) : [];
    } else if (JSON_MULTI_VALUE_HEADERS_IX[k]) {
      doc[k] = doc[k].replace(/[\[\]]/g, '').split(',').filter((x: string) => !!x).map((x: string) => x.replace(/'/g, ''));
    } else if (BOOLEAN_FIELDS_IX[k]) {
      doc[k] = doc[k].toLowerCase() === 'true';
    }
  });
  doc.id = doc.objectId;
  delete doc.objectId;
  doc.hasPrimaryImage = !!doc.primaryImageUrl;
  doc.hasTags = !!doc.tags.length;
  doc.objectBeginDate = +doc.objectBeginDate;
  doc.objectEndDate = +doc.objectEndDate;
  return doc;
}

pipeline(
  createReadStream(DATA_FILE),
  csvParse({ from: 2, delimiter: ',', columns: HEADERS.slice() }),
  map.obj(normalizeDocument),
  search.indexes.use('artworks9').createIndexingStream(),
);
