const pool = require('../../config/db');
const moment = require('moment');

const getClientLatestIds = async () => {
  try {
    const clientLatestIdsQuery = `
      SELECT MAX(id) AS latest_id , client_id 
      FROM client_plan_history
      GROUP BY client_id;
    `;

    const { rows } = await pool.query(clientLatestIdsQuery);
    return rows.map(row => row.latest_id);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Example usage inside an asynchronous function
const currentPlanHistoryIds = async () => {

  try {
    const result = await getClientLatestIds();
    // console.log('Client latest ids:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Call the asynchronous function
currentPlanHistoryIds();

/*----------------------------------------------------------------------------------*/
                      /* UPDATE  PST ID to 4 FROM OLD CPH ID */ 

const updatePlanStatus = async () => {
  try {
    const updateQuery = `
    UPDATE client_plan_history
    SET plan_status_type_id = 4 
    WHERE (id, client_id) NOT IN (
      SELECT MAX(id) AS max_id, client_id
      FROM client_plan_history
      GROUP BY client_id
    );    
    `;

    // Execute the update query
    await pool.query(updateQuery);

    // Fetch and log the updated rows
    const updatedRowsQuery = `
      SELECT id, client_id, plan_status_type_id 
      FROM client_plan_history
      WHERE plan_status_type_id = 4;
    `;

    const { rows } = await pool.query(updatedRowsQuery);

    rows.forEach(row => {
// console.log(`ID: ${row.id}, Client ID: ${row.client_id}, PST ID: ${row.plan_status_type_id}`);
    });
  } catch (error) {
    console.error('Error updating plan status:', error);
  }
};

// Example usage
updatePlanStatus();

/*----------------------------------------------------------------------------------------------*/ 

const updatePausedDateAndStatus = async () => {
  try {
    // Query to get client_id, latest_id, and latest_paused_date
    const query = `
    SELECT cph.client_id, cph.id AS latest_id, cph.plan_paused_date AS latest_paused_date
    FROM client_plan_history cph
    JOIN (
        SELECT client_id, MAX(id) AS max_id
        FROM client_plan_history
        GROUP BY client_id
    ) max_ids ON cph.client_id = max_ids.client_id AND cph.id = max_ids.max_id;    
    `;

    const { rows } = await pool.query(query);

    // Iterate through the result rows
    for (const row of rows) {
      const { client_id, latest_id, latest_paused_date } = row;

      // console.log(`Processing client_id: ${client_id}`);
      // console.log(`Latest ID: ${latest_id}`);
      // console.log(`Latest Paused Date: ${latest_paused_date}`);


      // Compare latest_paused_date with the current date using moment
      const currentDate = moment();
      const pausedDate = moment(latest_paused_date, 'DD-MMM-YYYY');

      // console.log(`Current Date: ${currentDate.format('DD-MMM-YYYY')}`);
      // console.log(`Paused Date: ${pausedDate.format('DD-MMM-YYYY')}`);


      // Check if the paused date is today
      if (pausedDate.isSame(currentDate, 'day')) {
        // Update plan_status_type_id to 3 using the latest_id
        const updateQuery = `
          UPDATE client_plan_history
          SET plan_status_type_id = 3
          WHERE id = $1;
        `;


        const updateValues = [latest_id];

        await pool.query(updateQuery, updateValues);

        console.log(`Updated plan_status_type_id for client_id ${client_id}`);
      }
    }
  } catch (error) {
    console.error('Error updating plan status:', error);
  }
};

// Call the function to update plan statuses
updatePausedDateAndStatus();

/*---------------------------------------------------------------------------------------------------- */
                  /* UPDATE ACTIVE_DATE , PST ID = 2  */
 
  const updateActiveDateAndStatus = async () => {
  try {
    // Query to get client_id, latest_id, and plan_active_date
    const activeDateQuery = `
      SELECT cph.client_id, cph.id AS latest_id, cph.plan_active_date AS plan_active_date
      FROM client_plan_history cph
      JOIN (
          SELECT client_id, MAX(id) AS max_id
          FROM client_plan_history
          GROUP BY client_id
      ) max_ids ON cph.client_id = max_ids.client_id AND cph.id = max_ids.max_id;    
    `;

    const { rows } = await pool.query(activeDateQuery);

    // Iterate through the result rows
    for (const row of rows) {
      const { client_id, latest_id, plan_active_date } = row;

      // Log values before the update
      // console.log(`Before Update - Client ID: ${client_id}, Latest ID: ${latest_id}, Plan Active Date: ${plan_active_date}`);

      // Compare plan_active_date with the current date using moment
      const currentDate = moment();
      const activeDate = moment(plan_active_date, 'DD-MMM-YYYY');

      // Check if the active date is today
      if (activeDate.isSame(currentDate, 'day')) {
        // Update plan_status_type_id to 2 using the latest_id
        const updateQuery = `
          UPDATE client_plan_history
          SET plan_status_type_id = 2
          WHERE id = $1;
        `;

        const updateValues = [latest_id];

        await pool.query(updateQuery, updateValues);

        // Log values after the update
        // console.log(`After Update - Client ID: ${client_id}, Latest ID: ${latest_id}, Plan Active Date: ${plan_active_date}`);
        // console.log(`Updated plan_status_type_id to 2 for client_id ${client_id}`);
      } else {
        // console.log('Dates do not match. No update performed.');
      }
    }
  } catch (error) {
    console.error('Error updating plan status:', error);
  }
};

// Call the function to update plan statuses
updateActiveDateAndStatus();
            
/* ---------------------------------------------------------------------------------------------- */
                 /* UPDATE  END_DATE , PST ID = 4 FROM CPH WHERE ID = MAX(ID) USING MOMENT */
 

const updateEndDateAndStatus = async () => {
  try {
    // Query to get client_id, latest_id, and latest_end_date
    const query = `
      SELECT cph.client_id, cph.id AS latest_id, cph.end_date AS latest_end_date
      FROM client_plan_history cph
      JOIN (
          SELECT client_id, MAX(id) AS max_id
          FROM client_plan_history
          GROUP BY client_id
      ) max_ids ON cph.client_id = max_ids.client_id AND cph.id = max_ids.max_id;    
    `;

    const { rows } = await pool.query(query);

    // Iterate through the result rows
    for (const row of rows) {
      const { client_id, latest_id, latest_end_date } = row;

      // Compare latest_end_date with the current date using moment
      const currentDate = moment();
      const endDate = moment(latest_end_date, 'DD-MMM-YYYY');

      // Check if the end_date is today
      if (endDate.isSame(currentDate, 'day')) {
        // Update plan_status_type_id to 4 using the latest_id
        const updateQuery = `
          UPDATE client_plan_history
          SET plan_status_type_id = 4
          WHERE id = $1;
        `;

        const updateValues = [latest_id];

        await pool.query(updateQuery, updateValues);

        console.log(`Updated plan_status_type_id to 4 for client_id ${client_id}`);
      }
    }
  } catch (error) {
    console.error('Error updating plan status:', error);
  }
};

// Call the function to update plan statuses
updateEndDateAndStatus();

/*----------------------------------------------------------------------------------------------------*/

const updateStartDateAndStatus = async () => {
  try {
    // Query to get client_id, latest_id, and latest_start_date
    const query = `
      SELECT cph.client_id, cph.id AS latest_id, cph.start_date AS latest_start_date
      FROM client_plan_history cph
      JOIN (
          SELECT client_id, MAX(id) AS max_id
          FROM client_plan_history
          GROUP BY client_id
      ) max_ids ON cph.client_id = max_ids.client_id AND cph.id = max_ids.max_id
      WHERE cph.plan_status_type_id = 1;  
    `;

    const { rows } = await pool.query(query);

    // Iterate through the result rows
    for (const row of rows) {
      const { client_id, latest_id, latest_start_date } = row;

      // Compare latest_start_date with the current date using moment
      const currentDate = moment();
      const startDate = moment(latest_start_date, 'DD-MMM-YYYY');

      // Check if the start_date is today
      if (startDate.isSame(currentDate, 'day')) {
        // Update plan_status_type_id to 2 using the latest_id
        const updateQuery = `
          UPDATE client_plan_history
          SET plan_status_type_id = 2
          WHERE id = $1;
        `;

        const updateValues = [latest_id];

        await pool.query(updateQuery, updateValues);

        console.log(`Updated plan_status_type_id to 2 for client_id ${client_id}`);
      }
    }
  } catch (error) {
    console.error('Error updating plan status:', error);
  }
};

// Call the function to update plan statuses



const updatePlanStatusTo4 = async () => {
    try {
      const updateQuery = `
        UPDATE client_plan_history AS cph
        SET plan_status_type_id = 4
        WHERE id NOT IN (
          SELECT MAX(id) AS max_id
          FROM client_plan_history
          GROUP BY client_id
        );
      `;
  
      const result = await pool.query(updateQuery);
  
      console.log('Update completed successfully.');
      console.log('Rows affected:', result.rowCount); // Log the number of rows affected
    } catch (error) {
      console.error('Error updating plan status:', error);
    }
  };
  
  // Call the asynchronous functions in sequence
  const startDate = async () => {
    console.log('Starting updates...');
    await updateStartDateAndStatus();
    console.log('First update completed.');
    await updatePlanStatusTo4();
    console.log('Second update completed.');
  };

/*------------------------------------------------------------------------------------------- */
                     /* MIDDLEWARE FUNCTION */
 // Assuming the update functions are defined and exported in your file
// middleware.js
const updatePlanStatusesMiddleware = async (req, res, next) => {
  try {

  //   // Update plan status based on start date 
   await startDate();

    // Update plan status based on paused date
    await updatePausedDateAndStatus();

    // Update plan status based on active date
    await updateActiveDateAndStatus();

    // Update plan status based on end date
    await updateEndDateAndStatus();

    // Update plan status to 4 for all records except the latest one
    await updatePlanStatus();



    console.log('All plan status updates completed successfully.');

    // Call next() to move to the next middleware or route handler
    if (next) {
      next();
    }
  } catch (error) {
    console.error('Error in updatePlanStatusesMiddleware:', error);

    // Check if res is defined before using it
    if (res) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = { updatePlanStatusesMiddleware };
