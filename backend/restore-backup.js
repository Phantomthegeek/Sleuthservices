#!/usr/bin/env node
/**
 * Restore Backup Script for Capital Reclaim
 * 
 * Usage:
 *   node restore-backup.js backup_2025-10-29_1234567890.tar.gz
 * 
 * This will restore data files and uploads from a backup.
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

async function restoreBackup(backupFileName) {
  if (!backupFileName || !backupFileName.endsWith('.tar.gz')) {
    console.error('❌ Invalid backup file. Must be a .tar.gz file.');
    process.exit(1);
  }
  
  const backupPath = path.join(BACKUP_DIR, backupFileName);
  
  try {
    // Check if backup exists
    await fs.access(backupPath);
    console.log(`📦 Restoring from: ${backupFileName}`);
    
    // Create temp extraction directory
    const tempDir = path.join(BACKUP_DIR, 'temp_restore');
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {}
    await fs.mkdir(tempDir, { recursive: true });
    
    // Extract backup
    console.log('📂 Extracting backup...');
    await execAsync(`cd "${BACKUP_DIR}" && tar -xzf "${backupFileName}" -C temp_restore`);
    
    // Find the extracted backup folder
    const extractedDirs = await fs.readdir(tempDir);
    if (extractedDirs.length === 0) {
      throw new Error('Backup extraction failed');
    }
    
    const extractedBackupPath = path.join(tempDir, extractedDirs[0]);
    
    // Read manifest
    const manifestPath = path.join(extractedBackupPath, 'manifest.json');
    let manifest = {};
    try {
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      manifest = JSON.parse(manifestData);
      console.log(`📋 Backup Info:`);
      console.log(`   Date: ${manifest.timestamp}`);
      console.log(`   Files: ${manifest.dataFiles?.length || 0} data files\n`);
    } catch (e) {
      console.warn('⚠️  Could not read manifest file');
    }
    
    // Backup current data (safety backup)
    const safetyBackupPath = path.join(BACKUP_DIR, `safety_backup_before_restore_${Date.now()}.tar.gz`);
    console.log('💾 Creating safety backup of current data...');
    try {
      await execAsync(`cd "${__dirname}" && tar -czf "${safetyBackupPath}" data/ uploads/ 2>/dev/null || true`);
      console.log(`✅ Safety backup created: ${path.basename(safetyBackupPath)}\n`);
    } catch (e) {
      console.warn('⚠️  Could not create safety backup (non-fatal)');
    }
    
    // Restore data files
    console.log('📄 Restoring data files...');
    const dataBackupPath = path.join(extractedBackupPath, 'data');
    try {
      const dataFiles = await fs.readdir(dataBackupPath);
      for (const file of dataFiles) {
        if (file.endsWith('.json')) {
          const src = path.join(dataBackupPath, file);
          const dest = path.join(DATA_DIR, file);
          await fs.copyFile(src, dest);
          console.log(`   ✓ Restored: ${file}`);
        }
      }
    } catch (e) {
      console.warn('⚠️  Could not restore data files:', e.message);
    }
    
    // Restore uploads
    console.log('\n📁 Restoring uploads...');
    const uploadsBackupPath = path.join(extractedBackupPath, 'uploads');
    try {
      // Backup existing uploads
      const existingUploadsBackup = path.join(BACKUP_DIR, `existing_uploads_${Date.now()}`);
      try {
        await execAsync(`cp -r "${UPLOADS_DIR}" "${existingUploadsBackup}" 2>/dev/null || true`);
      } catch (e) {}
      
      // Restore uploads
      await execAsync(`cp -r "${uploadsBackupPath}"/* "${UPLOADS_DIR}"/ 2>/dev/null || true`);
      console.log('   ✓ Uploads restored');
    } catch (e) {
      console.warn('⚠️  Could not restore uploads:', e.message);
    }
    
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('\n✅ Restore completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Restart the server');
    console.log('   2. Verify data in admin dashboard');
    console.log('   3. Check uploaded files');
    
  } catch (error) {
    console.error('\n❌ Restore failed:', error.message);
    console.error('\n⚠️  If data was partially restored, check your safety backup.');
    process.exit(1);
  }
}

// Get backup file from command line
const backupFile = process.argv[2];

if (!backupFile) {
  console.log('📋 Available backups:');
  fs.readdir(BACKUP_DIR)
    .then(files => {
      const backups = files.filter(f => f.startsWith('backup_') && f.endsWith('.tar.gz'));
      if (backups.length === 0) {
        console.log('   No backups found.');
      } else {
        backups.forEach((backup, i) => {
          console.log(`   ${i + 1}. ${backup}`);
        });
      }
      console.log('\nUsage: node restore-backup.js backup_YYYY-MM-DD_XXXXXXXXXX.tar.gz');
    })
    .catch(err => {
      console.error('Error reading backup directory:', err);
    });
} else {
  restoreBackup(backupFile);
}

