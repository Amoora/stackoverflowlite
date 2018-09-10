import Promise from 'bluebird';
import dotenv from 'dotenv';

const initOptions = {
  promiseLib: Promise,
};

import pgPromise from 'pg-promise';
const pgp = pgPromise(initOptions);
dotenv.config();

const connect = process.env.LOCALDB || process.env.DATABASE_URL ||  'postgres://amfkobyu:S9n_ehoxnMtEWJofJvlOgz2yMvf59JSa@horton.elephantsql.com:5432/amfkobyu';
const db = pgp(connect);

export default db;
