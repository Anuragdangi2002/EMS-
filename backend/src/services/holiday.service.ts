import { holidayRepository } from "../repositories/holiday.repository";
import { NotFoundError } from "../utils/error.util";
import { Messages } from "../constants/messages";

export class HolidayService {
  async createHoliday(data: any) {
    return holidayRepository.create({
      title: data.title,
      date: new Date(data.date),
      description: data.description,
      isOptional: data.isOptional ?? false,
    });
  }

  async getAllHolidays() {
    return holidayRepository.findAll();
  }

  async getHolidayById(id: string) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) {
      throw new NotFoundError(Messages.HOLIDAY.NOT_FOUND);
    }
    return holiday;
  }

  async updateHoliday(id: string, data: any) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) {
      throw new NotFoundError(Messages.HOLIDAY.NOT_FOUND);
    }

    return holidayRepository.update(id, {
      title: data.title,
      date: data.date ? new Date(data.date) : undefined,
      description: data.description,
      isOptional: data.isOptional,
    });
  }

  async deleteHoliday(id: string) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) {
      throw new NotFoundError(Messages.HOLIDAY.NOT_FOUND);
    }
    return holidayRepository.delete(id);
  }
}

export const holidayService = new HolidayService();
