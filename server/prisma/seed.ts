import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting JECRC Alumni Diwali 2026 Database Seeding ---');

  const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@JECRC2026!';
  const volunteerUsername = process.env.INITIAL_VOLUNTEER_USERNAME || 'volunteer1';
  const volunteerPassword = process.env.INITIAL_VOLUNTEER_PASSWORD || 'Volunteer@JECRC2026!';

  // 1. Seed or Upsert Active Event
  const activeEvent = await prisma.event.upsert({
    where: { id: 'jecrc-diwali-2026-main-event' },
    update: {
      name: 'JECRC University Alumni Diwali Get-Together 2026',
      year: 2026,
      eventDate: new Date('2026-11-04T05:30:00.000Z'), // Wednesday, 4 Nov 2026, 11:00 AM IST
      venue: 'JECRC University Campus, Ramchandrapura, Sitapura, Jaipur (Entry from Gate 01 - Main Gate)',
      isActive: true,
    },
    create: {
      id: 'jecrc-diwali-2026-main-event',
      name: 'JECRC University Alumni Diwali Get-Together 2026',
      year: 2026,
      eventDate: new Date('2026-11-04T05:30:00.000Z'), // Wednesday, 4 Nov 2026, 11:00 AM IST
      venue: 'JECRC University Campus, Ramchandrapura, Sitapura, Jaipur (Entry from Gate 01 - Main Gate)',
      isActive: true,
    },
  });

  console.log(`✓ Active Event configured: "${activeEvent.name}" (${activeEvent.id})`);

  // 2. Seed Admin Account
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, adminSalt);

  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
    create: {
      username: adminUsername,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✓ Admin User configured: username="${adminUser.username}", role=${adminUser.role}`);

  // 3. Seed Volunteer Account
  const volunteerSalt = await bcrypt.genSalt(10);
  const volunteerHash = await bcrypt.hash(volunteerPassword, volunteerSalt);

  const volunteerUser = await prisma.user.upsert({
    where: { username: volunteerUsername },
    update: {
      passwordHash: volunteerHash,
      role: Role.VOLUNTEER,
    },
    create: {
      username: volunteerUsername,
      passwordHash: volunteerHash,
      role: Role.VOLUNTEER,
    },
  });

  console.log(`✓ Volunteer User configured: username="${volunteerUser.username}", role=${volunteerUser.role}`);

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
