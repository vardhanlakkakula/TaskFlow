import Todo from "../models/Todo.js";

// Create Todo
export const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      user: req.user._id,
      title: req.body.title,
      priority: req.body.priority,
      deadline: req.body.deadline,
      reminder: req.body.reminder,
      reminderSent: false,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Todos
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Update Todo
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    // Store old reminder
    const oldReminder = todo.reminder
      ? new Date(todo.reminder).getTime()
      : null;

    // Get new reminder
    const newReminder =
      req.body.reminder !== undefined &&
      req.body.reminder !== null &&
      req.body.reminder !== ""
        ? new Date(req.body.reminder).getTime()
        : null;


    // Update title
    if (req.body.title !== undefined) {
      todo.title = req.body.title;
    }

    // Update priority
    if (req.body.priority !== undefined) {
      todo.priority = req.body.priority;
    }

    // Update deadline
    if (req.body.deadline !== undefined) {
      todo.deadline = req.body.deadline || null;
    }

    // Update reminder
    if (req.body.reminder !== undefined) {
      todo.reminder = req.body.reminder || null;
    }

    // Update completed status
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }


    // If reminder was changed,
    // allow the reminder email to be sent again
    if (oldReminder !== newReminder) {
      todo.reminderSent = false;
    }


    const updatedTodo = await todo.save();

    res.json(updatedTodo);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete Todo
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    await todo.deleteOne();

    res.json({
      message: "Todo deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};