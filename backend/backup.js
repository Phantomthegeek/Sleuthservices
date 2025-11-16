#!/usr/bin/env node
/**
 * Automated Backup Script for Capital Reclaim
 * 
 * Usage:
 *   node backup.js                    # Manual backup
 *   node backup.js --auto            # Auto backup (for cron)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(__dirname, 'backups');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log('✅ Backup directory ready');
  } catch (error) {
    console.error('❌ Failed to create backup directory:', error);
    process.exit(1);
  }
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupDate = `${timestamp}_${Date.now()}`;
  const backupPath = path.join(BACKUP_DIR, `backup_${backupDate}`);
  
  try {
    await fs.mkdir(backupPath, { recursive: true });
    console.log(`📦 Creating backup: ${backupDate}`);
    
    // Backup data files
    console.log('📄 Backing up data files...');
    const dataBackupPath = path.join(backupPath, 'data');
    await fs.mkdir(dataBackupPath, { recursive: true });
    
    const dataFiles = await fs.readdir(DATA_DIR);
    for (const file of dataFiles) {
      if (file.endsWith('.json')) {
        const src = path.join(DATA_DIR, file);
        const dest = path.join(dataBackupPath, file);
        await fs.copyFile(src, dest);
      }
    }
    
    // Backup uploads (compress large folders)
    console.log('📁 Backing up uploads...');
    const uploadsBackupPath = path.join(backupPath, 'uploads');
    try {
      await execAsync(`cp -r "${UPLOADS_DIR}" "${uploadsBackupPath}"`);
    } catch (error) {
      console.warn('⚠️  Uploads backup may have failed (non-fatal):', error.message);
    }
    
    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      backupId: backupDate,
      dataFiles: dataFiles.filter(f => f.endsWith('.json')),
      version: '1.0.0'
    };
    
    await fs.writeFile(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Compress backup
    console.log('🗜️  Compressing backup...');
    const archivePath = `${backupPath}.tar.gz`;
    await execAsync(`cd "${BACKUP_DIR}" && tar -czf "${path.basename(archivePath)}" "${path.basename(backupPath)}"`);
    await fs.rm(backupPath, { recursive: true, force: true });
    
    const stats = await fs.stat(archivePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`✅ Backup created successfully: ${backupDate}`);
    console.log(`📊 Backup size: ${sizeMB} MB`);
    console.log(`💾 Location: ${archivePath}`);
    
    return archivePath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

async function cleanOldBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const now = Date.now();
    const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    let deleted = 0;
    for (const file of files) {
      if (file.startsWith('backup_') && file.endsWith('.tar.gz')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          deleted++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} old backup(s)`);
    }
  } catch (error) {
    console.warn('⚠️  Failed to clean old backups:', error.message);
  }
}

async function main() {
  console.log('🚀 Capital Reclaim Backup System');
  console.log('================================\n');
  
  await ensureBackupDir();
  await createBackup();
  await cleanOldBackups();
  
  console.log('\n✅ Backup process completed!');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createBackup, cleanOldBackups };

