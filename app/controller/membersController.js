// const pool = require('../../config/db');

// exports.membersList =  (async(req, res) => {
//   // return res.status(200).json({ test: "carebuddies" });


// // app.post('/members_list', authenticate, async (req, res) => {
//   const authHeader = req.headers.authorization;

//   const { userId, mobileNumber, user, carebuddies } = req;
//   let page_no = req.body.page_no;
//   let carebuddy = req.body.carebuddy;
//   let locality = req.body.locality;
//   let status = req.body.status;
//   let plan = req.body.plan;
//   let is_total_count = req.body.is_total_count;

//   let limit = 10;
//   let offset = 0;

//   if (page_no && page_no !== null && page_no !== 0 )
//   {
//     offset = (page_no - 1) * 10;
//   }

  
//   let memberCarebuddiesQuery = "SELECT m.id, m.name, m.salutation, m.gender, m.dob, m.phone, m.whatsapp, m.address1, m.address2, m.address3, m.area, m.city, m.state, cm.relationship, c.name as client_name"
//   memberCarebuddiesQuery = memberCarebuddiesQuery + ", c.family_name, p.name as plan_name, p.color as plan_color , ms.member_status_type_id , mst.id as mst_id, mst.name as mst_name, mst.color as status_color";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " FROM members m";

//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN member_carebuddy mc ON m.id = mc.member_id  ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN client_members cm ON m.id = cm.member_id  ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN clients c ON cm.client_id = c.id  ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN member_statuses ms ON m.id = ms.member_id ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN member_status_types mst ON ms.member_status_type_id = mst.id  ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " JOIN client_plans cp ON c.id = cp.client_id  ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " LEFT JOIN plans p ON cp.plan_id = p.id  ";

//   memberCarebuddiesQuery = memberCarebuddiesQuery + " where m.is_active = true ";

  
//   if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
//     memberCarebuddiesQuery = memberCarebuddiesQuery + " AND mc.carebuddy_id IN ("+carebuddy+") ";
//   else
//     memberCarebuddiesQuery = memberCarebuddiesQuery + " AND mc.carebuddy_id IN ("+carebuddies+") ";
  
//   if(locality && locality !== null && locality.length !== 0)
//     memberCarebuddiesQuery = memberCarebuddiesQuery + " AND m.city IN ('"+locality.split(",").join("','")+"') ";

//   if(status && status !== null && status.length !== 0)
//     memberCarebuddiesQuery = memberCarebuddiesQuery + " AND ms.member_status_type_id IN ("+status+")  ";

//   if(plan && plan !== null && plan.length !== 0)
//     memberCarebuddiesQuery = memberCarebuddiesQuery + " AND cp.plan_id IN ("+plan+")  ";

//   memberCarebuddiesQuery = memberCarebuddiesQuery + " GROUP BY m.id, m.name, cm.relationship, c.name ";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " ,c.family_name, p.name, p.color, ms.member_status_type_id ,p.color, mst.id, mst.name";
//   memberCarebuddiesQuery = memberCarebuddiesQuery + " order by ( c.name, m.id) desc ";

//   console.log(memberCarebuddiesQuery);
//   const values = [carebuddies];
//   const members = await pool.query(memberCarebuddiesQuery+" LIMIT "+limit+" OFFSET "+offset+";");
//   let memberCount = 0;
//   if (is_total_count && is_total_count === "true"){
//     const membersCountRes = await pool.query(memberCarebuddiesQuery);
//     memberCount = membersCountRes.rowCount;
//   }

//   console.log(members.rows);
//   let memberData = members.rows

//   let member_ids = memberData.map(item => item.id);

//  let tasks = []
//   let interactions = []
  
//   if (member_ids && member_ids.length != 0){
//     tasks = await tasksData(member_ids);
//     interactions =  await interactionsData(member_ids);
//   }
  
//   let memberFinalData = []
  
//   memberData.forEach(function(member, i, arr){
//     member.interactions = interactions.filter((interaction) => interaction.member_id === member.id);
//     member.tasks = tasks.filter((task) => task.member_id === member.id);
//     memberFinalData.push(member);
//   });

//   // } catch (error) {
//   //   console.error('Error communicating with the database:', error);
//     return res.status(200).json({ carebuddies: carebuddies, user: user, mobileNumber: mobileNumber, userId: userId, user_id: req.body.user_id, role_id: req.body.role_id ,  memberData: memberFinalData, total_count: memberCount });
//   // }
// });

// async function tasksData(member_ids) {

//   let tasks_query = "select t.task_title, t.id, t.due_date, tm.member_id  ";
//   tasks_query = tasks_query +" from tasks t, task_members tm where t.id = tm.task_id ";
//   tasks_query = tasks_query +" and tm. member_id in ("+member_ids+") and t.task_status_type_id in (3,4) and t.is_active = true ";
//   tasks_query = tasks_query +" group by t.task_title, t.id, t.due_date, tm.member_id"

//   const tasks = await pool.query(tasks_query);
//   console.log(tasks.rows);
//   return tasks.rows;
// }

// async function interactionsData(member_ids) {
//   let interaction_query = "select i.title, i.id, i.interaction_date, im.member_id, ist.color, ist.id as interaction_status_id ";
//   interaction_query = interaction_query +"from interactions i, interaction_members im , interaction_status_types ist where i.id = im. interaction_id  ";
//   interaction_query = interaction_query +" and im. member_id in ("+member_ids+") and i.interaction_status_type_id in (3,4) and i.is_active = true ";
//   interaction_query = interaction_query +" group by i.title, i.id, i.interaction_date, im.member_id, ist.color, ist.id;"

//   const interactions = await pool.query(interaction_query);
//   console.log(interactions.rows);
//   return interactions.rows;
// }


// exports.localityList = async (req, res) => {
//   const authHeader = req.headers.authorization;
//   try {
//     const authHeader = req.headers.authorization;
//     let locality_query = "SELECT city FROM members WHERE city <> '' GROUP BY city ORDER BY city";
//     console.log(locality_query);
//     const cityData = await pool.query(locality_query);
//     return res.status(200).json({ status: true, data: cityData.rows });
//   } catch (error) {
//     console.error('Error: ', error);
//     return res.status(500).json({ status: false, message: 'Internal Server Error' });
//   }
// };


const pool = require('../../config/db');

exports.membersList = async (req, res) => {
  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;
  let page_no = req.body.page_no;
  let carebuddy = req.body.carebuddy;
  let locality = req.body.locality;
  let status = req.body.status;
  let plan = req.body.plan;
  let is_total_count = req.body.is_total_count;

  let limit = 10;
  let offset = 0;

  if (page_no && page_no !== null && page_no !== 0) {
    offset = (page_no - 1) * 10;
  }

  let memberCarebuddiesQuery =
    "SELECT m.id, m.name, m.salutation, m.gender, m.dob, m.phone, m.whatsapp, m.address1, m.address2, m.address3, m.area, m.city, m.state, cm.relationship, c.name as client_name" +
    ", CASE WHEN LENGTH(c.family_name) > 15 AND POSITION(' ' IN c.family_name) > 0 THEN SPLIT_PART(c.family_name, ' ', 2) ELSE c.family_name END AS family_name" +
    ", p.name as plan_name, p.color as plan_color , ms.member_status_type_id , mst.id as mst_id, mst.name as mst_name, mst.color as status_color" +
    " FROM members m" +
    " JOIN member_carebuddy mc ON m.id = mc.member_id" +
    " JOIN client_members cm ON m.id = cm.member_id" +
    " JOIN clients c ON cm.client_id = c.id" +
    " JOIN member_statuses ms ON m.id = ms.member_id" +
    " JOIN member_status_types mst ON ms.member_status_type_id = mst.id" +
    " JOIN client_plans cp ON c.id = cp.client_id" +
    " LEFT JOIN plans p ON cp.plan_id = p.id" +
    " WHERE m.is_active = true";

  if (carebuddy && carebuddy !== null && carebuddy.length !== 0)
    memberCarebuddiesQuery +=
      " AND mc.carebuddy_id IN (" + carebuddy + ") ";
  else
    memberCarebuddiesQuery +=
      " AND mc.carebuddy_id IN (" + carebuddies + ") ";

  if (locality && locality !== null && locality.length !== 0)
    memberCarebuddiesQuery +=
      " AND m.city IN ('" + locality.split(",").join("','") + "') ";

  if (status && status !== null && status.length !== 0)
    memberCarebuddiesQuery +=
      " AND ms.member_status_type_id IN (" + status + ")  ";

  if (plan && plan !== null && plan.length !== 0)
    memberCarebuddiesQuery += " AND cp.plan_id IN (" + plan + ")  ";

  memberCarebuddiesQuery +=
    " GROUP BY m.id, m.name, cm.relationship, c.name" +
    ", CASE WHEN LENGTH(c.family_name) > 15 AND POSITION(' ' IN c.family_name) > 0 THEN SPLIT_PART(c.family_name, ' ', 2) ELSE c.family_name END" +
    ", p.name, p.color, ms.member_status_type_id, p.color, mst.id, mst.name" +
    " ORDER BY (c.name, m.id) DESC LIMIT " +
    limit +
    " OFFSET " +
    offset;

  console.log(memberCarebuddiesQuery);
  const values = [carebuddies];
  const members = await pool.query(memberCarebuddiesQuery);
  let memberCount = 0;
  if (is_total_count && is_total_count === "true") {
    const membersCountRes = await pool.query(
      "SELECT COUNT(*) FROM (" + memberCarebuddiesQuery + ") AS count"
    );
    memberCount = membersCountRes.rows[0].count;
  }

  console.log(members.rows);
  let memberData = members.rows;

  let member_ids = memberData.map((item) => item.id);

  let tasks = [];
  let interactions = [];

  if (member_ids && member_ids.length != 0) {
    tasks = await tasksData(member_ids);
    interactions = await interactionsData(member_ids);
  }

  let memberFinalData = [];

  memberData.forEach(function (member, i, arr) {
    member.interactions = interactions.filter(
      (interaction) => interaction.member_id === member.id
    );
    member.tasks = tasks.filter((task) => task.member_id === member.id);
    memberFinalData.push(member);
  });

  return res.status(200).json({
    carebuddies: carebuddies,
    user: user,
    mobileNumber: mobileNumber,
    userId: userId,
    user_id: req.body.user_id,
    role_id: req.body.role_id,
    memberData: memberFinalData,
    total_count: memberCount,
  });
};

async function tasksData(member_ids) {
  let tasks_query =
    "SELECT t.task_title, t.id, t.due_date, tm.member_id" +
    " FROM tasks t, task_members tm" +
    " WHERE t.id = tm.task_id" +
    " AND tm.member_id IN (" +
    member_ids +
    ")" +
    " AND t.task_status_type_id IN (3,4) AND t.is_active = true" +
    " GROUP BY t.task_title, t.id, t.due_date, tm.member_id";

  const tasks = await pool.query(tasks_query);
  console.log(tasks.rows);
  return tasks.rows;
}

async function interactionsData(member_ids) {
  let interaction_query =
    "SELECT i.title, i.id, i.interaction_date, im.member_id, ist.color, ist.id as interaction_status_id" +
    " FROM interactions i, interaction_members im , interaction_status_types ist" +
    " WHERE i.id = im. interaction_id" +
    " AND im. member_id IN (" +
    member_ids +
    ")" +
    " AND i.interaction_status_type_id IN (3,4) AND i.is_active = true" +
    " GROUP BY i.title, i.id, i.interaction_date, im.member_id, ist.color, ist.id";

  const interactions = await pool.query(interaction_query);
  console.log(interactions.rows);
  return interactions.rows;
}

exports.localityList = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    const authHeader = req.headers.authorization;
    let locality_query =
      "SELECT city FROM members WHERE city <> '' GROUP BY city ORDER BY city";
    console.log(locality_query);
    const cityData = await pool.query(locality_query);
    return res.status(200).json({ status: true, data: cityData.rows });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};
