const admin = require('firebase-admin');
const serviceAccount = require('../../config/firebase_config.json');
const pool = require('../../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No authorization header present' });
  }

  const bearerToken = authHeader.split(' ')[1];

  let decodedToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(bearerToken);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.userId = decodedToken.user_id;
  req.mobileNumber = decodedToken.phone_number;

  const query = 'SELECT id, role_id FROM users WHERE uid = $1 AND mobile_number = $2';
  const { rows } = await pool.query(query, [decodedToken.user_id, decodedToken.phone_number]);

  if (rows.length > 0) {
    req.user = rows[0];
  } else {
    return res.status(401).json({ error: 'User not authorized' });
  }

  next();
};

module.exports = authenticate;