import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreateRecordInput, UpdateRecordInput, ListRecordsInput } from './records.schema';

const recordSelect = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, email: true, role: true },
  },
};

export const recordsService = {
  async createRecord(input: CreateRecordInput, userId: string) {
    return prisma.financialRecord.create({
      data: {
        userId,
        amount: input.amount,
        type: input.type,
        category: input.category,
        date: new Date(input.date),
        description: input.description,
      },
      select: recordSelect,
    });
  },

  async listRecords(input: ListRecordsInput) {
    const { page, limit, type, category, from, to, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(type && { type }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        select: recordSelect,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRecordById(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
      select: recordSelect,
    });
    if (!record) throw AppError.notFound('Financial record not found');
    return record;
  },

  async updateRecord(id: string, input: UpdateRecordInput) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });
    if (!record) throw AppError.notFound('Financial record not found');

    return prisma.financialRecord.update({
      where: { id },
      data: {
        ...input,
        ...(input.date && { date: new Date(input.date) }),
      },
      select: recordSelect,
    });
  },

  async softDeleteRecord(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });
    if (!record) throw AppError.notFound('Financial record not found');

    await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
