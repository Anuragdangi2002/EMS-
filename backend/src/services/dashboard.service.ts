import { Role } from "@prisma/client";
import { dashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
  async getDashboard(currentUser?: { userId: string; role: Role }) {
    return dashboardRepository.getCounts(currentUser);
  }
}

export const dashboardService = new DashboardService();