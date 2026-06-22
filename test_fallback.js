const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const { createSampleCourse } = require('./.next/server/app/api/extract/route.js'); // wait, easier to just run TS
    console.log("TS node isn't set up, let's just use ts-node if available or wait for user.");
  } catch(e) {
    console.error(e);
  }
}
test();
