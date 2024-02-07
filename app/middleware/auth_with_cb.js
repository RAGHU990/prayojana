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
    console.log(error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.userId = decodedToken.user_id;
  req.mobileNumber = decodedToken.phone_number;

  const query = 'SELECT id, role_id FROM users WHERE uid = $1 AND mobile_number = $2';
  const { rows } = await pool.query(query, [decodedToken.user_id, decodedToken.phone_number]);

  if (rows.length > 0) {
    req.user = rows[0];

    user_id = req.body.user_id;
    role_id = req.body.role_id;
    console.log("role_id"+ role_id);
    console.log("user_id"+ user_id);

    if (role_id  && role_id !== null ) {
        if (user_id && user_id !== null) // role_id,user_id
        {
            console.log("test1" );

            req.carebuddies = await getCarebuddy(role_id, user_id)
        }
        else {
            console.log("test2" );

            // bearer_userid, role_id
            req.carebuddies = await getCarebuddy(role_id, rows[0].id)
        }
    }
    else 
    {
        console.log("test3" );
        // bearer_userid, bearer_role_id
        req.carebuddies = await getCarebuddy( rows[0].role_id, rows[0].id)
    }

  } else {
    return res.status(401).json({ error: 'User not authorized' });
  }

  next();
  
};

async function getCarebuddy(role_id, user_id) {
    let carebuddies = [];
    let adminCarebuddiesQuery = "";
    carebuddies.push(user_id);

    if (role_id === 1) {
      adminCarebuddiesQuery = `SELECT cc.carebuddy_id, cc.captain_id FROM captain_carebuddy cc 
        LEFT JOIN admin_captain ac ON ac.captain_id = cc.captain_id 
        WHERE cc.is_active = true AND (ac.admin_id = $1 OR cc.captain_id = $1) 
        GROUP BY cc.carebuddy_id, cc.captain_id;`;
    } else if (role_id === 2) {
      adminCarebuddiesQuery = `SELECT carebuddy_id, captain_id FROM captain_carebuddy 
        WHERE is_active = true AND captain_id = $1 
        GROUP BY carebuddy_id, captain_id;`;
    }

    console.log(adminCarebuddiesQuery );

  
    try {
      const { rows } = await pool.query(adminCarebuddiesQuery, [user_id]);
      console.log(rows );

      if (rows !== null && rows.length > 0) {
        let captainIds = rows.map(item => item.captain_id);
        let carebuddies_id = rows.map(item => item.carebuddy_id);
  
        carebuddies = carebuddies.concat(carebuddies_id);
        // carebuddies = carebuddies.concat(captainIds);
      }
      return carebuddies;
    } catch (error) {
      console.error('Error retrieving carebuddies:', error);
      throw error;
    }
  }
  

module.exports = authenticate;