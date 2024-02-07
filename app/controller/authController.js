
const pool = require('../../config/db');

exports.checkMobile = async (req, res) => {
  const request = req.body;

  if (!request.mobileNumber) {
    const response = {
      status: false,
      message: 'Please send mobile number',
      code: 'input/undefined',
      error: { message: 'Please send mobile number' },
    };
    return res.status(400).json(response);
  }

  if (request.mobileNumber === null) {
    const response = {
      status: false,
      message: 'Invalid mobile number',
      code: 'input/invalid',
      error: { message: 'Invalid mobile number' },
    };
    return res.status(400).json(response);
  }

  const query = {
    text: `
      SELECT id, mobile_number
      FROM users
      WHERE mobile_number = $1
    `,
    values: [request.mobileNumber],
  };

  try {
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const response = {
        status: true,
        message: 'success',
      };
      return res.status(200).json(response);
    } else {
      const response = {
        status: false,
        message: 'No user found',
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    const response = {
      status: false,
      message: error.message,
      error: { message: error.message, detail: error.toString() },
    };
    return res.status(500).json(response);
  }
};


exports.checkUser = async (req, res) => {
  const { userId, mobileNumber, user } = req;
  const roleId = user.role_id;
  const user_id = user.id;

  let query =  {text: `
  select u.id, u.role_id, u.mobile_number, u.name, 
p.profile_photo, p.email, p.dob ,p.city,
p.country, p.address1, p.address2, p.address3, p.whatsapp, p.gender
from users u,  people p where u.id = p.user_id and u.id = $1
  `,
  values: [user.id],
  }
  const result = await pool.query(query);
  let user_info = {}
  if (result && result.length!= 0){
    user_info = result.rows[0]
  }

  // User exists in the users table
  return res.status(200).json({
    message: 'User authenticated successfully',
    role_id: roleId,
    user_id: user_id,
    data: user_info
  });

  
};