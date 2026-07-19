    import { Prisma, Shift } from "@prisma/client";
    import { prisma } from "../config/prisma";

    export class ShiftRepository {
    async create(
        data: Prisma.ShiftCreateInput
    ): Promise<Shift> {
        return prisma.shift.create({
        data,
        });
    }

    async findAll(): Promise<Shift[]> {
        return prisma.shift.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        });
    }

    async findById(
        id: string
    ): Promise<Shift | null> {
        return prisma.shift.findUnique({
        where: {
            id,
        },
        });
    }

    async findByName(
        name: string
    ): Promise<Shift | null> {
        return prisma.shift.findUnique({
        where: {
            name,
        },
        }); 
    }

    async update(
        id: string,
        data: Prisma.ShiftUpdateInput
    ): Promise<Shift> {
        return prisma.shift.update({
        where: {
            id,
        },
        data,
        });
    }

    async softDelete(
        id: string
    ): Promise<Shift> {
        return prisma.shift.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
        });
    }
    }

    export const shiftRepository =
    new ShiftRepository();