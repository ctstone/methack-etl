import { camelCase } from 'lodash';

export const HEADERS = [
  'ignore',
  'Object Number',
  'Is Highlight',
  'Is Public Domain',
  'Object ID',
  'Department',
  'Object Name',
  'Title',
  'Culture',
  'Period',
  'Dynasty',
  'Reign',
  'Portfolio',
  'Artist Role',
  'Artist Prefix',
  'Artist Display Name',
  'Artist Display Bio',
  'Artist Suffix',
  'Artist Alpha Sort',
  'Artist Nationality',
  'Artist Begin Date',
  'Artist End Date',
  'Object Date',
  'Object Begin Date',
  'Object End Date',
  'Medium',
  'Dimensions',
  'Credit Line',
  'Geography Type',
  'City',
  'State',
  'County',
  'Country',
  'Region',
  'Subregion',
  'Locale',
  'Locus',
  'Excavation',
  'River',
  'Classification',
  'Rights and Reproduction',
  'Link Resource',
  'Metadata Date',
  'Repository',
  'Tags',
  'PrimaryImageUrl',
  'AdditionalImageUrls',
].map((x) => camelCase(x));

export const DROP_HEADERS = HEADERS.filter((x) =>
  x.startsWith('ignore')
  || x === 'artistAlphaSort'
  || x === 'linkResource'
  || x === 'repository');
export const DROP_HEADERS_IX: { [key: string]: boolean } = {};
DROP_HEADERS.forEach((k) => DROP_HEADERS_IX[k] = true);

export const MULTI_VALUE_HEADERS = [
  'artistRole',
  'artistPrefix',
  'artistDisplayName',
  'artistDisplayBio',
  'artistBeginDate',
  'artistEndDate',
  'geographyType',
  'country',
  'city',
  'artistNationality',
  'region',
  'state',
  'county',
  'classification',
  'artistSuffix',
  'artistAlphaSort',
  // add
  'title',
  'medium',
  'subregion',
  'locus',
  'locale',
  'excavation',
];

export const JSON_MULTI_VALUE_HEADERS = [
  'tags',
  'additionalImageUrls',
];

export const MULTI_VALUE_HEADERS_IX: { [key: string]: boolean } = { };
MULTI_VALUE_HEADERS.forEach((k) => MULTI_VALUE_HEADERS_IX[k] = true);

export const JSON_MULTI_VALUE_HEADERS_IX: { [key: string]: boolean } = { };
JSON_MULTI_VALUE_HEADERS.forEach((k) => JSON_MULTI_VALUE_HEADERS_IX[k] = true);

export const BOOLEAN_FIELDS = [
  'isPublicDomain',
  'isHighlight',
];
export const BOOLEAN_FIELDS_IX: { [key: string]: boolean } = { };
BOOLEAN_FIELDS.forEach((k) => BOOLEAN_FIELDS_IX[k] = true);
