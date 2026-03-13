import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose._mongooseInstance) {
  globalForMongoose._mongooseInstance = mongoose;
}

export default globalForMongoose._mongooseInstance;
