import { ObjectId } from "mongodb";
import { getMongoDb } from "@/src/server/db/mongodb";
import { normalizeEmail } from "@/src/utils/auth";

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  googleId: string;
  image: string | null;
  lastLoginAt: string;
  name: string;
};

type UserDocument = {
  _id: ObjectId;
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  googleId: string;
  image: string | null;
  lastLoginAt: Date;
  name: string;
  updatedAt: Date;
};

type UpsertGoogleUserInput = {
  email: string;
  emailVerified: boolean;
  googleId: string;
  image?: string | null;
  name?: string | null;
};

let ensureIndexesPromise: Promise<void> | null = null;

async function getUsersCollection() {
  const db = await getMongoDb();
  return db.collection<UserDocument>("users");
}

async function ensureUserIndexes() {
  if (!ensureIndexesPromise) {
    ensureIndexesPromise = (async () => {
      const collection = await getUsersCollection();
      await collection.createIndex({ email: 1 }, { unique: true, name: "users_email_unique" });
      await collection.createIndex({ googleId: 1 }, { unique: true, name: "users_google_id_unique" });
    })();
  }

  return ensureIndexesPromise;
}

export async function upsertGoogleUser(input: UpsertGoogleUserInput): Promise<AuthUser> {
  await ensureUserIndexes();

  const collection = await getUsersCollection();
  const now = new Date();
  const email = normalizeEmail(input.email);
  const record = await collection.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        emailVerified: input.emailVerified,
        googleId: input.googleId,
        image: input.image?.trim() || null,
        lastLoginAt: now,
        name: input.name?.trim() || "BHORKIT Devotee",
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
    },
  );

  if (!record) {
    throw new Error("Failed to upsert authenticated user.");
  }

  return serializeUser(record);
}

export async function findUserByEmail(email: string) {
  await ensureUserIndexes();

  const collection = await getUsersCollection();
  const user = await collection.findOne({ email: normalizeEmail(email) });

  return user ? serializeUser(user) : null;
}

function serializeUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toHexString(),
    email: user.email,
    emailVerified: user.emailVerified,
    googleId: user.googleId,
    image: user.image,
    lastLoginAt: user.lastLoginAt.toISOString(),
    name: user.name,
  };
}
