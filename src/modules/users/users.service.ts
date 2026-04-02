import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { UpdateUserInput, ListUsersInput } from './users.schema';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { records: { where: { isDeleted: false } } } },
};

export const usersService = {
  async listUsers(input: ListUsersInput) {
    const { page, limit, role, status } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(status && { status }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw AppError.notFound('User not found');
    return user;
  },

  async updateUser(id: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');

    return prisma.user.update({
      where: { id },
      data: input,
      select: userSelect,
    });
  },

  async deactivateUser(id: string, requesterId: string) {
    if (id === requesterId) {
      throw AppError.badRequest('You cannot deactivate your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');

    return prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: userSelect,
    });
  },
};
