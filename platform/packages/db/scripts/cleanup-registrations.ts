// Script to clean up registrations with invalid user references
// Run this ONLY if you're okay with deleting existing registration data

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function cleanupRegistrations() {
  try {
    console.log('🧹 Cleaning up registrations...');
    
    // Delete all individual registrations
    const deletedIndividual = await prisma.individualRegistration.deleteMany({});
    console.log(`✅ Deleted ${deletedIndividual.count} individual registrations`);
    
    // Delete all team registrations and their pending members
    const deletedTeamRegs = await prisma.teamRegistration.deleteMany({});
    console.log(`✅ Deleted ${deletedTeamRegs.count} team registrations`);
    
    // Delete all finalized teams (if any exist with invalid members)
    const deletedTeams = await prisma.team.deleteMany({});
    console.log(`✅ Deleted ${deletedTeams.count} teams`);
    
    console.log('✨ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRegistrations();
