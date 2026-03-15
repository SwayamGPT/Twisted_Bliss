import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/twisted_bliss";

async function runBackup() {
  console.log('🔄 Starting Twisted Bliss Database Backup...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('✅ Connected to MongoDB.');

    // Need to cast connection to any or appropriately depending on mongoose version, but .db.collections() works
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");
    
    const collections = await db.collections();
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderPath = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(folderPath);

    for (let collection of collections) {
      const data = await collection.find({}).toArray();
      const filePath = path.join(folderPath, `${collection.collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`📦 Backed up ${collection.collectionName}.json (${data.length} records).`);
    }

    console.log(`🎉 Backup completed successfully! Saved to: ${folderPath}`);
  } catch (err) {
    console.error('❌ Backup failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runBackup();
