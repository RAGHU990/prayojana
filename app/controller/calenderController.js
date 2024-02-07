
const moment = require('moment');
const pool = require('../../config/db');

const authenticate_with_cb = require('../middleware/auth_with_cb');

exports.calenderList =  ( async (req, res) => {
  const authHeader = req.headers.authorization;

  const { userId, mobileNumber, user, carebuddies } = req;
  let carebuddy = req.body.carebuddy;
  let fromDate = req.body.from;
  let toDate = req.body.to;

  
if (!fromDate) {
    fromDate = moment().add(-30, 'days').format("YYYY-MM-DD");
}

if (!toDate) {
    toDate = moment(new Date()).format("YYYY-MM-DD");
}


  let tasksQuery = "select t.id, t.task_title, t.due_date::DATE, tst.id as tst_id,tst.name as tst_name, tst.color as tst_color, sp.name as sp_name, spt.name as sp_type, m.name as member_name, tm.member_id "
  // tasksQuery = tasksQuery + ", p.name as plan_name, p.color as plan_color ";
  tasksQuery = tasksQuery + "  from tasks t  ";
  tasksQuery = tasksQuery + "  inner join task_status_types tst on t.task_status_type_id = tst.id  ";
  tasksQuery = tasksQuery + "  inner join task_members tm on tm.task_id = t.id  ";
  tasksQuery = tasksQuery + "  inner join members m on tm.member_id = m.id  ";
  tasksQuery = tasksQuery + "  left join service_providers sp on t.service_provider_id = sp.id   ";
  tasksQuery = tasksQuery + "  left join service_provider_type spt on sp.service_provider_type_id = spt.id   ";
  tasksQuery = tasksQuery + " where t.is_active = true  "
  // tasksQuery = tasksQuery + " and c.id = cp.client_id and cp.plan_id = p.id";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddy+") ";
  else
    tasksQuery = tasksQuery + " AND t.carebuddy_id IN ("+carebuddies+") ";
  
  
    if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
        tasksQuery = tasksQuery + " and t.due_date between '"+fromDate+"' and '"+toDate+"' ";

  tasksQuery = tasksQuery + " group by t.id, t.task_title, t.due_date, tst.id, tst.name, tst.color, sp.name, spt.name, m.name, tm.member_id   ";
  // tasksQuery = tasksQuery + " p.name, p.color";

  console.log(tasksQuery);
  const tasks = await pool.query(tasksQuery);
  // console.log(tasks.rows);


  let interactionsQuery = "select i.title, i.id, i.notes, i.interaction_date::DATE,ist.id as ist_id, ist.name as status_name, ist.color as status_color, it.name as type_name, it.color as type_color, m.name as member_name, im.member_id"
  // interactionsQuery = interactionsQuery + ", p.name as plan_name, p.color as plan_color ";
  interactionsQuery = interactionsQuery + " from interactions i, interaction_members im, members m ,interaction_status_types ist, interaction_types it  ";
  interactionsQuery = interactionsQuery + " where i.is_active = true  and i.interaction_status_type_id = ist.id and it.id = i.interaction_type_id and  im.interaction_id = i.id and im.member_id = m.id "
  // interactionsQuery = interactionsQuery + " and c.id = cp.client_id and cp.plan_id = p.id";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    interactionsQuery = interactionsQuery + " AND i.carebuddy_id IN ("+carebuddy+") ";
  else
    interactionsQuery = interactionsQuery + " AND i.carebuddy_id IN ("+carebuddies+") ";
  
    if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
        interactionsQuery = interactionsQuery + " and i.interaction_date between '"+fromDate+"' and '"+toDate+"' ";

  interactionsQuery = interactionsQuery + " group by i.title, i.id, i.notes, i.interaction_date, ist.id, ist.name, ist.color , it.name , it.color,m.name, im.member_id ";
  // interactionsQuery = interactionsQuery + " p.name, p.color";
  interactionsQuery = interactionsQuery + " order by i.interaction_date desc";

  console.log(interactionsQuery);
  // return interactionsQuery;
  const interactions = await pool.query(interactionsQuery);
  // console.log(interactions.rows);




  // } catch (error) {
  //   console.error('Error communicating with the database:', error);
  return res.status(200).json({ status: true, tasks: tasks.rows , interactions: interactions.rows });
  // return { status: true, tasks: tasks.rows , interactions: interactions.rows };
  
});




