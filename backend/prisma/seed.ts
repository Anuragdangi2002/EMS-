import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password.util';
import { Role } from '@prisma/client';

async function main() {
  const hrEmail = process.env.INITIAL_HR_EMAIL;
  const hrPassword = process.env.INITIAL_HR_PASSWORD;
  const directorEmail = process.env.INITIAL_DIRECTOR_EMAIL;
  const directorPassword = process.env.INITIAL_DIRECTOR_PASSWORD;

  if (!hrEmail || !hrPassword || !directorEmail || !directorPassword) {
    throw new Error(
      "Missing required environment variables for seeding: " +
      "INITIAL_HR_EMAIL, INITIAL_HR_PASSWORD, INITIAL_DIRECTOR_EMAIL, INITIAL_DIRECTOR_PASSWORD"
    );
  }

  console.log('🌱 Starting database seeding...');

  // 1. Provision HR Account
  const existingHR = await prisma.user.findUnique({
    where: { email: hrEmail }
  });

  if (existingHR) {
    console.log(`ℹ HR user ${hrEmail} already exists. Skipping creation.`);
  } else {
    // Ensure HR department exists
    let hrDept = await prisma.department.findFirst({
      where: { code: 'HR-DEPT' }
    });
    if (!hrDept) {
      hrDept = await prisma.department.create({
        data: {
          name: 'Human Resources',
          code: 'HR-DEPT',
          description: 'HR Department',
          isActive: true
        }
      });
      console.log(`Created HR department: ${hrDept.name}`);
    }

    const hashedHrPassword = await hashPassword(hrPassword);
    const hrUser = await prisma.user.create({
      data: {
        email: hrEmail,
        password: hashedHrPassword,
        firstName: 'HR',
        lastName: 'Manager',
        role: Role.HR,
        status: 'ACTIVE',
        isEmailVerified: true
      }
    });
    console.log(`Created HR user: ${hrUser.email}`);

    const hrEmployee = await prisma.employee.create({
      data: {
        employeeCode: 'EMP-HR-001',
        userId: hrUser.id,
        firstName: 'HR',
        lastName: 'Manager',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'FEMALE',
        joiningDate: new Date(),
        employmentType: 'FULL_TIME',
        designation: 'HR Manager',
        departmentId: hrDept.id,
        address: '123 HR Street',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001',
        isActive: true,
        salary: 75000
      }
    });
    console.log(`Created HR Employee profile: ${hrEmployee.employeeCode}`);
  }

  // 2. Provision Director Account
  const existingDirector = await prisma.user.findUnique({
    where: { email: directorEmail }
  });

  if (existingDirector) {
    console.log(`ℹ Director user ${directorEmail} already exists. Skipping creation.`);
  } else {
    // Ensure Executive department exists
    let execDept = await prisma.department.findFirst({
      where: { code: 'EXEC-DEPT' }
    });
    if (!execDept) {
      execDept = await prisma.department.create({
        data: {
          name: 'Executive Office',
          code: 'EXEC-DEPT',
          description: 'Executive Management Department',
          isActive: true
        }
      });
      console.log(`Created Executive department: ${execDept.name}`);
    }

    const hashedDirectorPassword = await hashPassword(directorPassword);
    const directorUser = await prisma.user.create({
      data: {
        email: directorEmail,
        password: hashedDirectorPassword,
        firstName: 'Director',
        lastName: 'Admin',
        role: Role.DIRECTOR,
        status: 'ACTIVE',
        isEmailVerified: true
      }
    });
    console.log(`Created Director user: ${directorUser.email}`);

    const directorEmployee = await prisma.employee.create({
      data: {
        employeeCode: 'EMP-DIR-001',
        userId: directorUser.id,
        firstName: 'Director',
        lastName: 'Admin',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'MALE',
        joiningDate: new Date(),
        employmentType: 'FULL_TIME',
        designation: 'Director',
        departmentId: execDept.id,
        address: '100 Executive HQ',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001',
        isActive: true,
        salary: 150000
      }
    });
    console.log(`Created Director Employee profile: ${directorEmployee.employeeCode}`);
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
