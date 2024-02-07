// File: processData.js
const pool = require('../../config/db');

const fetchData = async (query) => {
  try {
    const { rows } = await pool.query(query);
    return rows[0]; // Assuming only one row is fetched
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    return null;
  }
};

const processData = async (req, res, next) => {
  const { member_id, task_id, interaction_id, admin_id, ref_id, event_type } = req.body; // Assuming the request body contains these fields

  let memberData, taskData, interactionData;
  if (event_type === "assign_member" || event_type === "update_member_details" || event_type === "switch_member" ){
    const memberDataQuery = `SELECT id, name FROM members WHERE id = ${ref_id};`;
     memberData = await fetchData(memberDataQuery);
  }
  else if (event_type === "created_task" || event_type === "updated_task" )
  {
    const taskDataQuery = `SELECT id, task_title FROM tasks WHERE id = ${ref_id};`;
     taskData = await fetchData(taskDataQuery);
  }
  else if (event_type === "created_interaction" || event_type === "updated_interaction" )
  {
    const interactionDataQuery = `SELECT id, title FROM interactions WHERE id = ${ref_id};`;
     interactionData = await fetchData(interactionDataQuery);
  }

  const userDataQuery = `SELECT id, name FROM users WHERE id = ${admin_id};`;

    const userData = await fetchData(userDataQuery);

    const name = {
      memberName: memberData ? memberData.name : null,
      memberId: memberData ? memberData.id : null,
      taskName: taskData ? taskData.task_title : null,
      taskId: taskData ? taskData.id : null,
      interactionTitle: interactionData ? interactionData.title : null,
      interactionId: interactionData ? interactionData.id : null,
      userName: userData ? userData.name : null,
    };

    req.processedData = name;
    next();
};



module.exports =  processData;