import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password.util';
import { Role } from '@prisma/client';

async function main() {
  const email = 'director@gmail.com';
  const password = 'Password123!';
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  // Ensure there is a department
  let dept = await prisma.department.findFirst({
    where: { code: 'EXEC-DEPT' }
  });
  if (!dept) {
    dept = await prisma.department.create({
      data: {
        name: 'Executive Office',
        code: 'EXEC-DEPT',
        description: 'Executive Management Department',
        isActive: true
      }
    });
    console.log(`Created department: ${dept.name}`);
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Director',
      lastName: 'Admin',
      role: Role.DIRECTOR,
      status: 'ACTIVE',
      isEmailVerified: true
    }
  });

  console.log(`Created Director user: ${user.email} with password: ${password}`);

  // Create corresponding employee record so they have a full profile
  const employee = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-DIR-001',
      userId: user.id,
      firstName: 'Director',
      lastName: 'Admin',
      dateOfBirth: new Date('1985-01-01'),
      gender: 'MALE',
      joiningDate: new Date(),
      employmentType: 'FULL_TIME',
      designation: 'Director',
      departmentId: dept.id,
      address: '100 Executive HQ',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      isActive: true,
      salary: 150000
    }
  });

  console.log(`Created Employee profile for Director: ${employee.employeeCode}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
