// Script to clean up duplicate teams before adding unique constraint
// This script will keep the team with more members and delete the duplicates

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function cleanupDuplicateTeams() {
  try {
    console.log('🔍 Searching for duplicate teams...\n');
    
    // Find all teams grouped by hackathonId and name
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        hackathonId: true,
        members: {
          select: {
            id: true,
            userId: true,
          }
        },
        submission: {
          select: {
            id: true,
          }
        }
      }
    });

    // Group teams by hackathonId + name
    const teamGroups = new Map<string, typeof teams>();
    
    for (const team of teams) {
      const key = `${team.hackathonId}:${team.name}`;
      if (!teamGroups.has(key)) {
        teamGroups.set(key, []);
      }
      teamGroups.get(key)!.push(team);
    }

    // Find duplicates
    let totalDuplicates = 0;
    
    for (const [key, group] of teamGroups.entries()) {
      if (group.length > 1) {
        const [hackathonId, teamName] = key.split(':');
        console.log(`\n📦 Found ${group.length} teams named "${teamName}" in hackathon ${hackathonId}`);
        
        // Sort by number of members (descending) and submission existence
        // Keep the team with more members or with a submission
        const sorted = group.sort((a, b) => {
          if (a.submission && !b.submission) return -1;
          if (!a.submission && b.submission) return 1;
          return b.members.length - a.members.length;
        });
        
        const keepTeam = sorted[0]!;
        const duplicates = sorted.slice(1);
        
        console.log(`   ✅ Keeping team ${keepTeam.id}`);
        console.log(`      - Members: ${keepTeam.members.length}`);
        console.log(`      - Has submission: ${keepTeam.submission ? 'Yes' : 'No'}`);
        
        // Process duplicates
        for (const duplicate of duplicates) {
          console.log(`   ❌ Deleting duplicate ${duplicate.id}`);
          console.log(`      - Members: ${duplicate.members.length}`);
          console.log(`      - Has submission: ${duplicate.submission ? 'Yes' : 'No'}`);
          
          // If duplicate has a submission, warn
          if (duplicate.submission) {
            console.warn(`      ⚠️  WARNING: This duplicate has a submission!`);
            console.warn(`      Consider manually moving the submission to team ${keepTeam.id}`);
          }
          
          // Delete the duplicate team (cascade will delete members and submission)
          await prisma.team.delete({
            where: { id: duplicate.id }
          });
          
          totalDuplicates++;
        }
      }
    }

    if (totalDuplicates === 0) {
      console.log('\n✨ No duplicate teams found! Database is clean.');
    } else {
      console.log(`\n✅ Cleanup complete! Removed ${totalDuplicates} duplicate team(s).`);
      console.log('\n💡 You can now run the migration to add the unique constraint:');
      console.log('   npx prisma migrate dev --name add-team-name-unique-constraint');
    }

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateTeams();
