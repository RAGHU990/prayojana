
const pool = require('../../config/db');

const fetchData = async (query) => {
  try {
    const { rows } = await pool.query(query);
    return rows; // Return an array of rows
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    return null;
  }
};

// Middleware function to check for overdue tasks and interactions
const overdueChecker = async (req, res, next) => {
  try {
    // Fetch all tasks with their id and due_date from the database
    const taskDueDateQuery = `SELECT id, due_date FROM tasks WHERE task_status_type_id = 2;`;
    const tasksResult = await fetchData(taskDueDateQuery);

    // Fetch all interactions with their id and interaction_date from the database
    const interactionDueDateQuery = `SELECT id, interaction_date FROM interactions WHERE interaction_status_type_id = 2;`;
    const interactionsResult = await fetchData(interactionDueDateQuery);

    // Collect IDs of overdue tasks and interactions
    const overdueTaskIds = [];
    const overdueInteractionIds = [];

    // Check each task for overdue status
    for (const task of tasksResult) {
      const currentDateTime = new Date();
      const dueDate = new Date(task.due_date);

      // Get the next day's date
      const nextDayDate = new Date(currentDateTime);
      nextDayDate.setDate(currentDateTime.getDate() + 1);

      // Check if the task is overdue (due date is earlier than the next day and not the same as the current day)
      if (dueDate < nextDayDate && dueDate.getDate() !== currentDateTime.getDate()) {
        // Task is overdue, add its ID to the array
        overdueTaskIds.push(task.id);
      }
    }

    // Check each interaction for overdue status
    for (const interaction of interactionsResult) {
      const currentDateTime = new Date();
      const dueDate = new Date(interaction.interaction_date);

      // Get the next day's date
      const nextDayDate = new Date(currentDateTime);
      nextDayDate.setDate(currentDateTime.getDate() + 1);

      // Check if the interaction is overdue (due date is earlier than the next day and not the same as the current day)
      if (dueDate < nextDayDate && dueDate.getDate() !== currentDateTime.getDate()) {
        // Interaction is overdue, add its ID to the array
        overdueInteractionIds.push(interaction.id);
      }
    }

    // Update task_status_id to 1 for overdue tasks
    if (overdueTaskIds.length > 0) {
      const updateTaskStatusQuery = `UPDATE tasks SET task_status_type_id = 1 WHERE id = ANY($1);`;
      await pool.query(updateTaskStatusQuery, [overdueTaskIds]);
    }

    // Update interaction_status_type_id to 3 for overdue interactions
    if (overdueInteractionIds.length > 0) {
      const updateInteractionStatusQuery = `UPDATE interactions SET interaction_status_type_id = 3 WHERE id = ANY($1);`;
      await pool.query(updateInteractionStatusQuery, [overdueInteractionIds]);
    }

    // Attach overdueTaskIds and overdueInteractionIds to the request object for use in other middleware or routes
    req.overdueTaskIds = overdueTaskIds;
    req.overdueInteractionIds = overdueInteractionIds;

    // Continue with the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error occurred while checking for overdue tasks and interactions:', error);
    // Handle the error as needed
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = overdueChecker;
