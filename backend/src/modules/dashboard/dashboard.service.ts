import { prisma } from '../../lib/prisma';

export const dashboardService = {
  async getSummary() {
    const [incomeResult, expenseResult, recordCount] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { type: 'INCOME', isDeleted: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.aggregate({
        where: { type: 'EXPENSE', isDeleted: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.count({ where: { isDeleted: false } }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpenses = expenseResult._sum.amount ?? 0;

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat((totalIncome - totalExpenses).toFixed(2)),
      totalRecords: recordCount,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
    };
  },

  async getByCategory() {
    const [income, expense] = await Promise.all([
      prisma.financialRecord.groupBy({
        by: ['category'],
        where: { type: 'INCOME', isDeleted: false },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
      }),
      prisma.financialRecord.groupBy({
        by: ['category'],
        where: { type: 'EXPENSE', isDeleted: false },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    return {
      income: income.map((r) => ({
        category: r.category,
        total: parseFloat((r._sum.amount ?? 0).toFixed(2)),
        count: r._count,
      })),
      expense: expense.map((r) => ({
        category: r.category,
        total: parseFloat((r._sum.amount ?? 0).toFixed(2)),
        count: r._count,
      })),
    };
  },

  async getByMonth() {
    // Use raw query for monthly grouping
    const rows = await prisma.$queryRaw<
      { year: number; month: number; type: string; total: number; count: bigint }[]
    >`
      SELECT
        EXTRACT(YEAR FROM date)::int  AS year,
        EXTRACT(MONTH FROM date)::int AS month,
        type,
        SUM(amount)::float            AS total,
        COUNT(*)                      AS count
      FROM financial_records
      WHERE is_deleted = false
      GROUP BY year, month, type
      ORDER BY year DESC, month DESC
    `;

    // Pivot into { year, month, income, expense }
    const monthMap: Record<
      string,
      { year: number; month: number; income: number; expense: number }
    > = {};

    for (const row of rows) {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = { year: row.year, month: row.month, income: 0, expense: 0 };
      }
      if (row.type === 'INCOME') {
        monthMap[key].income = parseFloat(Number(row.total).toFixed(2));
      } else {
        monthMap[key].expense = parseFloat(Number(row.total).toFixed(2));
      }
    }

    return Object.values(monthMap).sort(
      (a, b) => b.year - a.year || b.month - a.month
    );
  },

  async getRecent(limit = 10) {
    return prisma.financialRecord.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 50),
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        description: true,
        user: { select: { id: true, name: true } },
      },
    });
  },
};
