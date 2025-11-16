#!/usr/bin/env node
/**
 * Data Retention Policy and GDPR Compliance
 * 
 * This script implements data retention policies and GDPR compliance features:
 * - Automatic deletion of old case data based on retention period
 * - Data export for user requests (GDPR right to data portability)
 * - Data deletion on request (GDPR right to be forgotten)
 * 
 * Usage:
 *   node data-retention.js --cleanup [days]     # Delete cases older than X days
 *   node data-retention.js --export CASE_ID     # Export case data
 *   node data-retention.js --delete CASE_ID     # Delete case data
 *   node data-retention.js --stats              # Show retention statistics
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Default retention period (days) - can be overridden via env
const DEFAULT_RETENTION_DAYS = parseInt(process.env.DATA_RETENTION_DAYS) || 2555; // 7 years default
const COMPLETED_CASE_RETENTION = parseInt(process.env.COMPLETED_CASE_RETENTION_DAYS) || 1095; // 3 years for completed cases

/**
 * Read leads from JSON file
 */
async function readLeads() {
  try {
    const data = await fs.readFile(LEADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Write leads to JSON file
 */
async function writeLeads(leads) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

/**
 * Cleanup old cases based on retention policy
 */
async function cleanupOldCases(retentionDays = DEFAULT_RETENTION_DAYS) {
  try {
    const leads = await readLeads();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
    
    let deleted = 0;
    const deletedCaseIds = [];
    
    const remainingLeads = leads.filter(caseItem => {
      const caseDate = new Date(caseItem.createdAt || caseItem.updatedAt || now);
      
      // Different retention for completed cases
      const caseRetention = caseItem.status === 'completed' 
        ? COMPLETED_CASE_RETENTION 
        : retentionDays;
      const caseCutoffDate = new Date(now.getTime() - caseRetention * 24 * 60 * 60 * 1000);
      
      if (caseDate < caseCutoffDate) {
        deleted++;
        deletedCaseIds.push(caseItem.id);
        
        // Delete associated files
        if (caseItem.id) {
          const caseDir = path.join(UPLOADS_DIR, caseItem.id);
          fs.rm(caseDir, { recursive: true, force: true }).catch(() => {});
        }
        
        return false;
      }
      return true;
    });
    
    if (deleted > 0) {
      await writeLeads(remainingLeads);
      console.log(`✅ Deleted ${deleted} case(s) older than ${retentionDays} days`);
      console.log(`   Deleted case IDs: ${deletedCaseIds.join(', ')}`);
    } else {
      console.log(`✅ No cases found older than ${retentionDays} days`);
    }
    
    return { deleted, deletedCaseIds };
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Export case data for GDPR compliance (right to data portability)
 */
async function exportCaseData(caseId) {
  try {
    const leads = await readLeads();
    const caseItem = leads.find(c => c.id === caseId);
    
    if (!caseItem) {
      throw new Error(`Case ${caseId} not found`);
    }
    
    // Create export directory
    const exportDir = path.join(__dirname, 'exports');
    await fs.mkdir(exportDir, { recursive: true });
    
    // Export case data as JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      caseData: caseItem,
      gdprCompliant: true,
      exportedBy: 'data-retention-script'
    };
    
    const exportFile = path.join(exportDir, `case-${caseId}-${Date.now()}.json`);
    await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Case data exported: ${exportFile}`);
    return exportFile;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

/**
 * Delete case data (GDPR right to be forgotten)
 */
async function deleteCaseData(caseId) {
  try {
    const leads = await readLeads();
    const caseIndex = leads.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      throw new Error(`Case ${caseId} not found`);
    }
    
    // Delete case data
    leads.splice(caseIndex, 1);
    await writeLeads(leads);
    
    // Delete associated files
    const caseDir = path.join(UPLOADS_DIR, caseId);
    await fs.rm(caseDir, { recursive: true, force: true });
    
    console.log(`✅ Case ${caseId} and associated files deleted`);
    return true;
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    throw error;
  }
}

/**
 * Get retention statistics
 */
async function getRetentionStats() {
  try {
    const leads = await readLeads();
    const now = new Date();
    
    const stats = {
      totalCases: leads.length,
      byStatus: {},
      byAge: {
        lessThan30Days: 0,
        days30to90: 0,
        days90to365: 0,
        moreThan1Year: 0,
        moreThan3Years: 0,
        moreThan7Years: 0
      },
      willBeDeleted: {
        next30Days: 0,
        next90Days: 0,
        nextYear: 0
      }
    };
    
    leads.forEach(caseItem => {
      // Count by status
      const status = caseItem.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Calculate age
      const caseDate = new Date(caseItem.createdAt || caseItem.updatedAt || now);
      const ageDays = Math.floor((now - caseDate) / (24 * 60 * 60 * 1000));
      
      // Age buckets
      if (ageDays < 30) stats.byAge.lessThan30Days++;
      else if (ageDays < 90) stats.byAge.days30to90++;
      else if (ageDays < 365) stats.byAge.days90to365++;
      else if (ageDays < 1095) stats.byAge.moreThan1Year++;
      else if (ageDays < 2555) stats.byAge.moreThan3Years++;
      else stats.byAge.moreThan7Years++;
      
      // Deletion prediction
      const retentionDays = caseItem.status === 'completed' 
        ? COMPLETED_CASE_RETENTION 
        : DEFAULT_RETENTION_DAYS;
      const daysUntilDeletion = retentionDays - ageDays;
      
      if (daysUntilDeletion <= 30 && daysUntilDeletion > 0) stats.willBeDeleted.next30Days++;
      else if (daysUntilDeletion <= 90 && daysUntilDeletion > 0) stats.willBeDeleted.next90Days++;
      else if (daysUntilDeletion <= 365 && daysUntilDeletion > 0) stats.willBeDeleted.nextYear++;
    });
    
    return stats;
  } catch (error) {
    console.error('Failed to get stats:', error);
    throw error;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case '--cleanup':
        const days = parseInt(process.argv[3]) || DEFAULT_RETENTION_DAYS;
        console.log(`🧹 Cleaning up cases older than ${days} days...`);
        await cleanupOldCases(days);
        break;
        
      case '--export':
        const caseId = process.argv[3];
        if (!caseId) {
          console.error('❌ Please provide a case ID');
          process.exit(1);
        }
        await exportCaseData(caseId);
        break;
        
      case '--delete':
        const deleteCaseId = process.argv[3];
        if (!deleteCaseId) {
          console.error('❌ Please provide a case ID');
          process.exit(1);
        }
        console.log(`⚠️  Deleting case ${deleteCaseId}...`);
        await deleteCaseData(deleteCaseId);
        break;
        
      case '--stats':
        const stats = await getRetentionStats();
        console.log('\n📊 Data Retention Statistics:\n');
        console.log(JSON.stringify(stats, null, 2));
        break;
        
      default:
        console.log(`
📋 Data Retention & GDPR Compliance Tool

Usage:
  node data-retention.js --cleanup [days]     Delete cases older than X days (default: ${DEFAULT_RETENTION_DAYS})
  node data-retention.js --export CASE_ID     Export case data (GDPR right to data portability)
  node data-retention.js --delete CASE_ID     Delete case data (GDPR right to be forgotten)
  node data-retention.js --stats              Show retention statistics

Environment Variables:
  DATA_RETENTION_DAYS=${DEFAULT_RETENTION_DAYS} (default: 2555 days / 7 years)
  COMPLETED_CASE_RETENTION_DAYS=${COMPLETED_CASE_RETENTION} (default: 1095 days / 3 years)
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanupOldCases,
  exportCaseData,
  deleteCaseData,
  getRetentionStats
};

