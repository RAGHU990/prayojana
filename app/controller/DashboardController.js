
const pool = require('../../config/db');
const moment = require('moment');

exports.dashboardMetrics =  (async(req, res) => {

// app.post('/tasks', authenticate, async (req, res) => {
  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;
  let fromDate = req.body.from;
  let toDate = req.body.to;
  let carebuddy = req.body.carebuddy;

  if (!fromDate) {
      fromDate = moment().add(-7, 'days').format("YYYY-MM-DD");
  }

  if (!toDate) {
      toDate = moment(new Date()).format("YYYY-MM-DD");
  }

  let tasksQuery = "select   tst.name,tst.position, tst.color, count(t.id) as count from task_status_types tst "
  tasksQuery = tasksQuery + " left join tasks t on t.task_status_type_id = tst.id and t.is_active = true  ";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddy+") ";
  else
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddies+") ";
  
  if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
    tasksQuery = tasksQuery + " and t.due_date between '"+fromDate+"' and '"+toDate+"' ";
  
    tasksQuery = tasksQuery + " where tst.is_active = true  group by   tst.name,tst.position, tst.color  order by tst.position"

  console.log(tasksQuery);
  const tasks = await pool.query(tasksQuery);


  let interactionQuery = "select   ist.name,ist.position, ist.color, count(i.id) as count from interaction_status_types ist  "
  interactionQuery = interactionQuery + " left join interactions i on i.interaction_status_type_id = ist.id and i.is_active = true  ";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    interactionQuery = interactionQuery + " AND i.carebuddy_id IN ("+carebuddy+") ";
  else
    interactionQuery = interactionQuery + " AND i.carebuddy_id IN ("+carebuddies+") ";
  
  if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
    interactionQuery = interactionQuery + " and i.interaction_date between '"+fromDate+"' and '"+toDate+"' ";
  
    interactionQuery = interactionQuery + " where ist.is_active = true  group by   ist.name,ist.position, ist.color order by ist.position"

  console.log(interactionQuery);
  const interactions = await pool.query(interactionQuery);



  let memberQuery = "select  mst.name, mst.color, mst.position, count(m.id) as count from  member_status_types mst  "
  memberQuery = memberQuery + " left join member_statuses ms on ms.member_status_type_id = mst.id ";
 
  memberQuery = memberQuery + " left join members m on ms.member_id = m.id and m.is_active = true and ms.member_id = m.id ";
  if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
    memberQuery = memberQuery + " and  m.updated_at between '"+fromDate+"' and '"+toDate+"' ";

  memberQuery = memberQuery + " left join member_carebuddy mc on mc.member_id = m.id and mc.carebuddy_id in (72,73,74) ";
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    memberQuery = memberQuery + " AND mc.carebuddy_id IN ("+carebuddy+") ";
  else
    memberQuery = memberQuery + " AND mc.carebuddy_id IN ("+carebuddies+") ";
  
  memberQuery = memberQuery + " where mst.is_active = true  group by  mst.name, mst.color, mst.position order by mst.position; ";

  console.log(memberQuery);
  const members = await pool.query(memberQuery);

  // console.log(interactions.rows);
  return res.status(200).json({ status: true, task: tasks.rows, interactions: interactions.rows, members: members.rows });
  // }
});




