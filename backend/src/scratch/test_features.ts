import { prisma } from "../config/prisma";
import { holidayService } from "../services/holiday.service";
import { leaveService } from "../services/leave.service";
import { employeeService } from "../services/employee.service";
import { LeaveStatus, Role } from "@prisma/client";

async function testFeatures() {
  console.log("Testing features...");

  // 1. Holiday CRUD
  console.log("\n--- 1. Testing Holiday CRUD ---");
  const holiday = await holidayService.createHoliday({
    title: "Test Holiday " + Date.now(),
    date: new Date().toISOString(),
    description: "Test Description",
    isOptional: true,
  });
  console.log("Created Holiday:", holiday);

  const list = await holidayService.getAllHolidays();
  console.log(`Total Holidays: ${list.length}`);
  const found = list.some(h => h.id === holiday.id);
  console.log(`Found newly created holiday: ${found}`);

  await holidayService.deleteHoliday(holiday.id);
  console.log("Deleted Holiday successfully!");

  // 2. Team Query
  console.log("\n--- 2. Testing Team Query ---");
  // Find HR user's team details
  const hrUser = await prisma.user.findFirst({
    where: { email: "hr@gmail.com" },
  });
  if (hrUser) {
    const team = await employeeService.getMyTeam({
      userId: hrUser.id,
      role: Role.HR,
    });
    console.log("Team Details for HR:");
    console.log(`Manager: ${team.manager ? team.manager.id : "None"}`);
    console.log(`Peers count: ${team.peers.length}`);
    console.log(`Subordinates count: ${team.subordinates.length}`);
  }

  // 3. Leave balance auto deduction
  console.log("\n--- 3. Testing Leave Balance Deduction ---");
  const employee = await prisma.employee.findFirst({
    include: { user: true }
  });
  if (employee) {
    console.log(`Employee initial leave balance: ${employee.leaveBalance} days`);
    
    // Apply leave request
    const leave = await leaveService.applyLeave({
      employee: { connect: { id: employee.id } },
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-03"), // 3 days leave
      reason: "Test leave request",
      status: LeaveStatus.PENDING,
    });
    console.log(`Applied leave: ${leave.id}. Status: ${leave.status}`);

    // Approve leave request
    console.log("Approving leave request...");
    const approved = await leaveService.updateLeaveStatus(leave.id, LeaveStatus.APPROVED, {
      userId: employee.user.id,
      role: Role.DIRECTOR, // Approve as Director/Admin
    });
    console.log(`Approved status updated: ${approved.status}`);

    const updatedEmployee = await prisma.employee.findUnique({
      where: { id: employee.id }
    });
    console.log(`Employee updated leave balance after approval: ${updatedEmployee?.leaveBalance} days`);
    
    // Invalidate/Reject leave request to test refund
    console.log("Rejecting leave request (refunding)...");
    await leaveService.updateLeaveStatus(leave.id, LeaveStatus.REJECTED, {
      userId: employee.user.id,
      role: Role.DIRECTOR,
    });

    const refundedEmployee = await prisma.employee.findUnique({
      where: { id: employee.id }
    });
    console.log(`Employee leave balance after rejection (refunded): ${refundedEmployee?.leaveBalance} days`);

    // Clean up leave request
    await prisma.leave.delete({ where: { id: leave.id } });
    console.log("Cleaned up leave test record.");
  }
}

testFeatures()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
  });
