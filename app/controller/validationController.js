
const pool = require('../../config/db');

exports.checkIfDoctorExists = async (req, res) => {

  const requestBody = req.body;
  const { name } = requestBody;

  try {
    const doctorExists = await checkIfDoctorExists(name);

    if (doctorExists) {
      return res.status(400).json({
        status: false,
        message: 'Doctor name already exists',
      });
    }

    return res.status(200).json({
        staus: true,
      message: 'Doctor name doesn\'t exist',
    });
  } catch (error) {
    return res.status(500).json({
        status: false,
      message: 'Internal server error',
    });
  }
};

async function checkIfDoctorExists(name) {
  const query = {
    text: `
      SELECT id
      FROM doctors
      WHERE name = $1 AND is_active = true
    `,
    values: [name],
  };

  const result = await pool.query(query);
  return result.rows.length > 0;
}


// Medical center 






exports.checkIfMedicalCenterExists = async (req, res) => {

// app.post('/rest/validation/check_medical_center', async (req, res) => {
  const requestBody = req.body;
  const { name } = requestBody;

  try {
    const medicalCenterExists = await checkIfExists(name, 'medical_centers');

    if (medicalCenterExists) {
      return res.status(400).json({
        status: false,
        message: 'Medical center name already exists',
      });
    }

    return res.status(200).json({
        status: true,
      message: 'Medical center name doesn\'t exist',
    });
  } catch (error) {
    return res.status(500).json({
        status: false,
      message: 'Internal server error',
    });
  }
};

async function checkIfExists(name, tableName) {
  const query = {
    text: `
      SELECT id
      FROM ${tableName}
      WHERE name = $1 AND is_active = true
    `,
    values: [name],
  };

  const result = await pool.query(query);
  return result.rows.length > 0;
}

// Service Providers

exports.checkIfServiceProviderExists = async (req, res) => {

// app.post('/rest/validation/check_service_provider', async (req, res) => {
  const requestBody = req.body;
  const { name } = requestBody;

  try {
    const serviceProviderExists = await checkIfServiceProviderExists(name);

    if (serviceProviderExists) {
      return res.status(400).json({
        status: false,
        message: 'Service provider name already exists',
      });
    }

    return res.status(200).json({
        status: true,
      message: 'Service provider name doesn\'t exist',
    });
  } catch (error) {
    return res.status(500).json({
        status: false,
      message: 'Internal server error',
    });
  }
};

async function checkIfServiceProviderExists(name) {
  const query = {
    text: `
      SELECT id
      FROM service_providers
      WHERE name = $1 AND is_active = true
    `,
    values: [name],
  };

  const result = await pool.query(query);
  return result.rows.length > 0;
}

