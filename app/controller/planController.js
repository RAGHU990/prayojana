
const pool = require('../../config/db');
const bodyParser = require('body-parser');
const moment = require('moment');


// Function to parse date in "dd-mm-yyyy" format using moment
function parseDate(dateString) {
  return moment(dateString, 'DD-MMM-YYYY', true).toDate();
}

const fetchData = async (query, params) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows; // Return an array of rows
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    return null;
  }
};

const planStatus = async (req, res) => {
  try {
    const {
      client_plan_history_id,
      paused_date: inputPausedDate,
      active_date: inputActiveDate,
      plan_status_type_id,
    } = req.body;

     // Parse dates using moment, defaulting to null if not provided
     const pausedDate = inputPausedDate ? moment(inputPausedDate, 'DD-MMM-YYYY', true).toDate() : null;
     const activeDate = inputActiveDate ? moment(inputActiveDate, 'DD-MMM-YYYY', true).toDate() : null;

    // Fetch existing data based on client_plan_history_id
    const clientPlanHistoryQuery =
      "SELECT * FROM client_plan_history WHERE id = $1";

    const existingData = await fetchData(clientPlanHistoryQuery, [
      client_plan_history_id,
    ]);

    // Check if data exists
    if (existingData && existingData.length > 0) {
      // Extract the existing data
      const existingRow = existingData[0];
  
      // Log the original activeDate and pausedDate
      console.log("Original activeDate - ", activeDate ? moment(activeDate).format('DD-MMM-YYYY') : 'Not provided');
      console.log("Original pausedDate - ", pausedDate ? moment(pausedDate).format('DD-MMM-YYYY') : 'Not provided');



      // Format dates only if they are provided
      const formattedPausedDate = pausedDate ? moment(pausedDate).format('DD-MMM-YYYY') : null;
      const formattedActiveDate = activeDate ? moment(activeDate).format('DD-MMM-YYYY') : null;

  
      // Calculate the difference between paused_date and active_date
      const diff = moment(activeDate).diff(moment(pausedDate));
  
      // Calculate years, months, and days difference
      const yearsDiff = moment.duration(diff).years();
      const monthsDiff = moment.duration(diff).months();
      const daysDiff = moment.duration(diff).days();
  
      console.log("Difference: ", yearsDiff, " years, ", monthsDiff, " months, ", daysDiff, " days");
  
      // Calculate the new end_date by adding the differences to existing end_date
      const newEndDate = moment(existingRow.end_date, 'DD-MMM-YYYY')
          .add(yearsDiff, 'years')
          .add(monthsDiff, 'months') 
          .add(daysDiff, 'days')
          .toDate();
  
      // Check if newEndDate is a valid date
      if (moment(newEndDate).isValid()) {
          // Format the new end_date to 'DD-MMM-YYYY'
          const formattedEndDate = moment(newEndDate).format('DD-MMM-YYYY');
          console.log("formattedEndDate - ", formattedEndDate);
  
          // Insert new row with additional information
          const insertQuery =
              "INSERT INTO client_plan_history " +
              "(plan_id, start_date, end_date, plan_amount, payment_date, amount_paid, " +
              "payment_type, payment_id, link, prid, client_id, plan_status_type_id, " +
              "plan_paused_date, plan_active_date) " +
              "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";
  
          const values = [
              existingRow.plan_id,
              existingRow.start_date,
              formattedEndDate, // Use the formatted date
              existingRow.plan_amount,
              existingRow.payment_date,
              existingRow.amount_paid,
              existingRow.payment_type,
              existingRow.payment_id,
              existingRow.link,
              existingRow.prid,
              existingRow.client_id, // Use the client_id from existing data
              plan_status_type_id,
              formattedPausedDate, // Use the formatted date or null
              formattedActiveDate, // Use the formatted date or null
          ];
  
          await pool.query(insertQuery, values);
  
          // Fetch the inserted data for response
          const insertedDataQuery =
              "SELECT * FROM client_plan_history WHERE id = (SELECT MAX(id) FROM client_plan_history)";
  
          const insertedData = await fetchData(insertedDataQuery, []);

          
          res.status(200).json({ message: 'Data inserted successfully', insertedData });
      } else {
          res.status(500).json({ error: 'Invalid date calculation' });
      }
  }
  else {
      res.status(404).json({ error: 'Data not found for the given ID' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Add other necessary routes and middleware as needed

module.exports = {
  planStatus,
};


// const pool = require('../../config/db');

