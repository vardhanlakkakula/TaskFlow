import cron from "node-cron";
import Todo from "../models/Todo.js";
import sendEmail from "./sendEmail.js";

const startReminderJob = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    console.log("Running reminder job...");

    const now = new Date();

    // Check reminders due within the next 1 minute
    const oneMinuteLater = new Date(
      now.getTime() + 60 * 1000
    );

    try {
      const todos = await Todo.find({
        reminder: {
          $gte: now,
          $lte: oneMinuteLater,
        },
        completed: false,
        reminderSent: false,
      }).populate("user");

      for (const todo of todos) {
        if (!todo.user || !todo.user.email) {
          console.log(
            `No email found for todo: ${todo.title}`
          );
          continue;
        }

        // Format deadline
        const deadlineText = todo.deadline
          ? new Date(todo.deadline).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "No deadline set";

        // Format reminder time
        const reminderText = todo.reminder
          ? new Date(todo.reminder).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "No reminder set";

        // Email subject
        const subject = `🔔 Reminder: ${todo.title}`;

        // Email body
        const message = `
Hello ${todo.user.name || "there"},

This is a reminder for your Todo.

Todo:
${todo.title}

Priority:
${todo.priority}

Reminder:
${reminderText}

Deadline:
${deadlineText}

Please complete your Todo before the deadline.

Thank you,
Todo Reminder App
`;

        await sendEmail(
          todo.user.email,
          subject,
          message
        );

        // Prevent duplicate emails
        todo.reminderSent = true;
        await todo.save();

        console.log(
          `Reminder sent for todo: ${todo.title}`
        );
      }
    } catch (error) {
      console.error(
        "Reminder job error:",
        error
      );
    }
  });
};

export default startReminderJob;