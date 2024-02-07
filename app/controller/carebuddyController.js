
const moment = require('moment');
const pool = require('../../config/db');


exports.carebuddyList =  ( async (req, res) => {
  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;

  

  let carebuddyQuery = "select u.id, u.name, u.mobile_number, u.role_id, p.profile_photo, COUNT(case when mc.carebuddy_type = 'primary' then mc.id end) as primary_count,  COUNT(case when mc.carebuddy_type = 'secondary' then mc.id end) as secondary_count "
  carebuddyQuery = carebuddyQuery + "   from users u  ";
  carebuddyQuery = carebuddyQuery + "  inner join people p on p.user_id = u.id  ";
  carebuddyQuery = carebuddyQuery + "  left join member_carebuddy mc on mc.carebuddy_id = u.id and mc.is_active = true  ";

  if (!(req.body.role_id && req.body.role_id.length !== 0) &&  user.role_id === 1)
    carebuddyQuery = carebuddyQuery + " where  u.role_id in (1,2,3,4) "
  else
    carebuddyQuery = carebuddyQuery + " where  u.id in ("+carebuddies+") "
  carebuddyQuery = carebuddyQuery + " group by u.id, u.name, u.mobile_number, u.role_id, p.profile_photo;  "
    
  console.log(carebuddyQuery);
  const carebuddy_list = await pool.query(carebuddyQuery);

  return res.status(200).json({ status: true, data: carebuddy_list.rows });
  
});


exports.captainList =  ( async (req, res) => {
  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;

  let captainQuery = "select u.id, u.name, u.mobile_number, u.role_id, p.profile_photo, COUNT(distinct mc.id ) as member_count,  COUNT(distinct cc.id) as carebuddy_count from users u "
  captainQuery = captainQuery + "   inner join people p on p.user_id = u.id  ";
  captainQuery = captainQuery + "  left join captain_carebuddy cc on cc.captain_id = u.id and cc.is_active = true  ";
  captainQuery = captainQuery + "  left join member_carebuddy mc on ( mc.carebuddy_id = u.id or cc.carebuddy_id = mc.carebuddy_id) and mc.is_active = true  ";
  captainQuery = captainQuery + " where  u.role_id in (1,2) group by u.id, u.name, u.mobile_number, u.role_id, p.profile_photo  "
    
  console.log(captainQuery);
  const captain_list = await pool.query(captainQuery);

  return res.status(200).json({ status: true, data: captain_list.rows });
  
});





