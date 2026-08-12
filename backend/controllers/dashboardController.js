import Todo from "../models/Todo.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const stats = await Todo.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      {
        $facet: {
          total: [
            {
              $count: "count",
            },
          ],

          completed: [
            {
              $match: {
                completed: true,
              },
            },
            {
              $count: "count",
            },
          ],

          pending: [
            {
              $match: {
                completed: false,
              },
            },
            {
              $count: "count",
            },
          ],

          overdue: [
            {
              $match: {
                completed: false,
                deadline: {
                  $lt: now,
                  $ne: null,
                },
              },
            },
            {
              $count: "count",
            },
          ],

          priorityStats: [
            {
              $group: {
                _id: "$priority",
                count: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    const total = result.total[0]?.count || 0;
    const completed = result.completed[0]?.count || 0;
    const pending = result.pending[0]?.count || 0;
    const overdue = result.overdue[0]?.count || 0;

    const priorityDistribution = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    result.priorityStats.forEach((item) => {
      if (item._id in priorityDistribution) {
        priorityDistribution[item._id] = item.count;
      }
    });

    const completionRate =
      total > 0
        ? ((completed / total) * 100).toFixed(2)
        : "0.00";

    res.json({
      total,
      completed,
      pending,
      overdue,
      completionRate,
      priorityDistribution,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};