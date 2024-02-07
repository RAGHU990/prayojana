
const pool = require('../../config/db');

// Task list
exports.tasksList =  (async(req, res) => {

  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;
  let page_no = req.body.page_no;
  let carebuddy = req.body.carebuddy;
  let members = req.body.members;
  let status = req.body.status;
  let fromDate = req.body.from;
  let toDate = req.body.to;

  let limit = 10;
  let offset = 0;

  if (page_no && page_no !== null && page_no !== 0 )
  {
    offset = (page_no - 1) * 10;
  }
  
  let tasksQuery = "select t.id, t.task_title, t.due_date::DATE, t.due_time, tst.name as tst_name, tst.color as tst_color, sp.name as sp_name, spt.name as sp_type, u.name as carebuddy_name,t.carebuddy_id "
  // tasksQuery = tasksQuery + ", p.name as plan_name, p.color as plan_color ";
  tasksQuery = tasksQuery + "  from tasks t  ";
  tasksQuery = tasksQuery + "  inner join task_status_types tst on t.task_status_type_id = tst.id  ";
  tasksQuery = tasksQuery + "  inner join task_members tm on t.id = tm.task_id ";
  tasksQuery = tasksQuery + "  inner join users  u on u.id = t.carebuddy_id ";
  tasksQuery = tasksQuery + "  left join service_providers sp on t.service_provider_id = sp.id   ";
  tasksQuery = tasksQuery + "  left join service_provider_type spt on sp.service_provider_type_id = spt.id   ";
  tasksQuery = tasksQuery + "  where t.is_active = true  "
  // tasksQuery = tasksQuery + " and c.id = cp.client_id and cp.plan_id = p.id";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddy+") ";
  else
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddies+") ";
  
    if(status && status !== null && status.length !== 0)
    tasksQuery = tasksQuery + " and t.task_status_type_id in ("+status+") ";

    if(members && members !== null && members.length !== 0)
      tasksQuery = tasksQuery + " and tm.member_id in ("+members+") ";

  
    if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
        tasksQuery = tasksQuery + " and t.due_date between '"+fromDate+"' and '"+toDate+"' ";

  tasksQuery = tasksQuery + " group by t.id, t.task_title, t.due_date, tst.name, tst.color, sp.name, spt.name, u.name   ";
  // tasksQuery = tasksQuery + " p.name, p.color";
  tasksQuery = tasksQuery + " order by t.created_at desc LIMIT "+limit+" OFFSET "+offset+";";

  console.log(tasksQuery);
  const tasks = await pool.query(tasksQuery);
  // console.log(tasks.rows);


  // } catch (error) {
  //   console.error('Error communicating with the database:', error);
    return res.status(200).json({ status: true, data: tasks.rows });
  // }
});


// Carebuddy list
  exports.carebuddyFilterList =  (async(req, res) => {
    const authHeader = req.headers.authorization;
    const { userId, mobileNumber, user, carebuddies } = req;

    let careBuddyQuery = "select id, name from users where id in ("+carebuddies+")  order by name"
    console.log(careBuddyQuery);
    const carebuddy_res = await pool.query(careBuddyQuery);
    return res.status(200).json({ status: true, data: carebuddy_res.rows });
  });


  // Carebuddy list
  exports.memberFilterList =  (async(req, res) => {
    const authHeader = req.headers.authorization;
    const { userId, mobileNumber, user, carebuddies } = req;

    let memberQuery = "select m.id, m.name from members m, member_carebuddy mc where m.id = mc.member_id and mc.carebuddy_id in ("+carebuddies+") group by m.id, m.name order by m.name"
    console.log(memberQuery);
    const member_res = await pool.query(memberQuery);
    return res.status(200).json({ status: true, data: member_res.rows });
  });





