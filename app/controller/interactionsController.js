const pool = require('../../config/db');

exports.interactionsList = (async (req, res) => {

// app.post('/interactions', authenticate, async (req, res) => {
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

  
  let interactionsQuery = "select i.title, i.id, i.notes, i.interaction_date::DATE, ist.name as status_name, ist.color as status_color, it.name as type_name, it.color as type_color, i.interaction_type_id "
  // interactionsQuery = interactionsQuery + ", p.name as plan_name, p.color as plan_color ";
  interactionsQuery = interactionsQuery + " from interactions i, interaction_status_types ist, interaction_types it, interaction_members im ";
  interactionsQuery = interactionsQuery + " where i.is_active = true  and i.interaction_status_type_id = ist.id  and it.id = i.interaction_type_id and im.interaction_id = i.id "
  // interactionsQuery = interactionsQuery + " and c.id = cp.client_id and cp.plan_id = p.id";
  
  if(carebuddy && carebuddy !== null && carebuddy.length !== 0)
    interactionsQuery = interactionsQuery + " AND i.carebuddy_id IN ("+carebuddy+") ";
  else
    interactionsQuery = interactionsQuery + " AND i.carebuddy_id IN ("+carebuddies+") ";
  
  if(status && status !== null && status.length !== 0)
    interactionsQuery = interactionsQuery + " and i.interaction_status_type_id in ("+status+") ";

    if(members && members !== null && members.length !== 0)
      interactionsQuery = interactionsQuery + " and im.member_id in ("+members+") ";


    if(fromDate && fromDate !== null && fromDate.length !== 0 && toDate && toDate !== null && toDate.length !== 0)
        interactionsQuery = interactionsQuery + " and i.interaction_date between '"+fromDate+"' and '"+toDate+"' ";

  interactionsQuery = interactionsQuery + " group by i.title, i.id, i.notes, i.interaction_date, ist.name, ist.color , it.name , it.color, i.interaction_type_id  ";
  // interactionsQuery = interactionsQuery + " p.name, p.color";
  interactionsQuery = interactionsQuery + " order by i.id desc LIMIT "+limit+" OFFSET "+offset+";";

  console.log(interactionsQuery);
  const interactions = await pool.query(interactionsQuery);
  console.log(interactions.rows);


  // } catch (error) {
  //   console.error('Error communicating with the database:', error);
    return res.status(200).json({ status: true, data: interactions.rows });
  // }
});




