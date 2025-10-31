// Script to create User records for existing registrations
// This preserves existing registration data by creating missing users

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('🔄 Starting user migration...');
    
    // Get all individual registrations
    const individualRegs = await prisma.individualRegistration.findMany({
      select: {
        userId: true,
      }
    });
    
    // Get all pending team members with claimed user IDs
    const claimedMembers = await prisma.pendingTeamMember.findMany({
      where: {
        claimedByUserId: { not: null }
      },
      select: {
        claimedByUserId: true,
      }
    });
    
    // Collect all unique user IDs that should exist
    const requiredUserIds = new Set<string>();
    individualRegs.forEach(reg => requiredUserIds.add(reg.userId));
    claimedMembers.forEach(member => {
      if (member.claimedByUserId) {
        requiredUserIds.add(member.claimedByUserId);
      }
    });
    
    console.log(`📊 Found ${requiredUserIds.size} unique user IDs in registrations`);
    
    // Check which users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: Array.from(requiredUserIds) }
      },
      select: { id: true }
    });
    
    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const missingUserIds = Array.from(requiredUserIds).filter(id => !existingUserIds.has(id));
    
    console.log(`✅ ${existingUsers.length} users already exist`);
    console.log(`❌ ${missingUserIds.length} users are missing`);
    
    if (missingUserIds.length > 0) {
      console.log('\n⚠️  WARNING: Cannot auto-create users with GitHub IDs.');
      console.log('These user IDs need to be migrated manually or users need to re-register:');
      console.log(missingUserIds);
      console.log('\n💡 Recommended action: Delete registrations with missing users and have them re-register.');
    } else {
      console.log('✨ All users exist! No migration needed.');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
