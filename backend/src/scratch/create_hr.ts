import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password.util';
import { Role } from '@prisma/client';

async function main() {
  const email = 'hr@gmail.com';
  const password = 'Password123!';
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  // Ensure there is a department
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({
      data: {
        name: 'Human Resources',
        code: 'HR-DEPT',
        description: 'HR Department',
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
      firstName: 'HR',
      lastName: 'Manager',
      role: Role.HR,
      status: 'ACTIVE',
      isEmailVerified: true
    }
  });

  console.log(`Created HR user: ${user.email} with password: ${password}`);

  // Create corresponding employee record so they have a full profile
  const employee = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-HR-001',
      userId: user.id,
      firstName: 'HR',
      lastName: 'Manager',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'FEMALE',
      joiningDate: new Date(),
      employmentType: 'FULL_TIME',
      designation: 'HR Manager',
      departmentId: dept.id,
      address: '123 HR Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      isActive: true,
      salary: 75000
    }
  });

  console.log(`Created Employee profile for HR: ${employee.employeeCode}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
