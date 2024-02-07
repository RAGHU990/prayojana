
const pool = require('../../config/db');

const updateClientPlanHistory = async (req, res) => {
  try {
    // Assuming req.body contains the client_id
    const client_id = req.body.client_id;

    const clientQuery = `
      UPDATE client_plan_history AS cph
      SET plan_status_type_id = 4
      WHERE client_id = $1
        AND id != (
          SELECT MAX(id)
          FROM client_plan_history
          WHERE client_id = $1
        );
    `;

    // Assuming you have a database connection pool named "pool"
    const { rowCount } = await pool.query(clientQuery, [client_id]);

    if (rowCount > 0) {
      // Rows were updated successfully
      res.status(200).json({
        status: 'success',
        message: `${rowCount} rows updated successfully.`,
      });
    } else {
      // No rows were updated
      res.status(404).json({
        status: 'not found',
        message: 'No rows found for the specified client_id.',
      });
    }
  } catch (error) {
    // Error occurred during the update
    console.error('Error updating client plan history:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

module.exports = updateClientPlanHistory;

