import { prisma } from '../config/prisma';

async function main() {
  const users = await prisma.user.findMany({
    include: { employee: true }
  });
  console.log('--- DATABASE USERS & EMPLOYEES ---');
  for (const user of users) {
    console.log(`User: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    if (user.employee) {
      console.log(`  Linked Employee: Code=${user.employee.employeeCode}, Desg=${user.employee.designation}, Active=${user.employee.isActive}`);
    } else {
      console.log(`  No Linked Employee`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
