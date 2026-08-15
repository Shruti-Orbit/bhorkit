import { MongoClient, type Db } from "mongodb";

const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const mongoDbName = process.env.MONGODB_DB ?? "bhorkit";

type MongoGlobal = typeof globalThis & {
  __bhorkitMongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

export function getMongoClient() {
  if (!globalForMongo.__bhorkitMongoClientPromise) {
    const client = new MongoClient(mongoUri, {
      appName: "bhorkit-catalog-service",
      maxPoolSize: 10,
    });

    globalForMongo.__bhorkitMongoClientPromise = client.connect();
  }

  return globalForMongo.__bhorkitMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(mongoDbName);
}

export function getMongoConfig() {
  return {
    dbName: mongoDbName,
    uri: mongoUri,
  };
}
