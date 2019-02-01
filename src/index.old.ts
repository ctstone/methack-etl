import { SearchService } from 'azure-search-client';
import csvParse = require('csv-parse');
import { config } from 'dotenv';
import { createReadStream } from 'fs-extra';
import * as through from 'through2';

import { BOOLEAN_FIELDS_IX, DROP_HEADERS_IX, HEADERS, JSON_MULTI_VALUE_HEADERS_IX, MULTI_VALUE_HEADERS, MULTI_VALUE_HEADERS_IX } from './headers';

config({ path: `${__dirname}/../.env` });

const SEARCH_SERVICE = process.env.SEARCH_SERVICE;
const SEARCH_KEY = process.env.SEARCH_KEY;
const DATA_FILE = '../data/MetArtworksAugmented.csv';
const HAS_MULTI_IX: { [key: string]: boolean } = {};
const BATCH_SIZE = 5000;
const INDEX_NAME = 'artworks9';

MULTI_VALUE_HEADERS.forEach((k) => HAS_MULTI_IX[k] = true);

function streamBatch(size: number, skip?: number) {
  const chunks: any[] = [];
  let skipped = 0;
  return through.obj(function(d, enc, cb) {
    if (!skip || skipped >= skip) {
      chunks.push(d);
      if (chunks.length === size) {
        this.push(chunks.slice());
        chunks.length = 0;
      }
    } else if (skip) {
      skipped += 1;
    }
    cb();
  }, function(cb) {
    if (chunks.length) {
      this.push(chunks);
    }
    cb();
  });
}

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

console.log('reading');
const search = new SearchService(SEARCH_SERVICE, SEARCH_KEY);

console.log('parsing');
let counter = 0;
createReadStream(DATA_FILE, 'utf8')
  .pipe(
    csvParse({
      delimiter: ',',
      columns: HEADERS.slice(),
    }),
  )
  .pipe(through.obj(function(d, enc, cb) {
    this.push(normalizeDocument(d));
    cb();
  }))
  .pipe(streamBatch(BATCH_SIZE))
  .pipe(through.obj((d, enc, cb) => {
    counter += d.length;
    console.log(d.length, counter);
    search.indexes.use(INDEX_NAME)
      .index(d)
      .then(() => cb())
      .catch((err) => {
        console.error(err);
        cb(err);
      });
  }));
