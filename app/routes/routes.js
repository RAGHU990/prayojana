const { messaging } = require('firebase-admin');

module.exports =  app => {
    const authenticate = require('../middleware/auth');
    const authenticate_with_cb = require('../middleware/auth_with_cb');
    const file = require('../controller/uploadImgController');
    const calender = require("../controller/calenderController");
    const interaction = require("../controller/interactionsController");
    const member = require("../controller/membersController");
    const task = require("../controller/tasksController");
    const dashboard = require("../controller/DashboardController");
    const carebuddy_captain = require("../controller/carebuddyController");
    const auth = require('../controller/authController');
    const validation = require('../controller/validationController');
    const updateNum = require('../controller/updatenumController');
    const createStaff = require('../controller/createuserController');
    const notify = require('../controller/notificationController')
    const processData =require('../middleware/processData');
    const overDue  = require('../middleware/overDue');
    const plan = require('../controller/planController');
    const { updatePlanStatusesMiddleware } = require('../middleware/planHistory');
    const updateClientPlanHistory = require('../controller/updatePlanController');

    
    app.post("/rest/calender_list", authenticate_with_cb, overDue, calender.calenderList);
    app.post("/rest/interactions", authenticate_with_cb, overDue, interaction.interactionsList);
    app.post("/rest/members_list", authenticate_with_cb,  member.membersList);
    app.post("/rest/tasks_list", authenticate_with_cb, overDue, task.tasksList);
    app.post("/rest/dashboard_metrics", authenticate_with_cb, overDue, dashboard.dashboardMetrics);
    app.post("/rest/carebuddies", authenticate_with_cb,  carebuddy_captain.carebuddyList);
    app.post("/rest/captains", authenticate,  carebuddy_captain.captainList);
    
    app.post('/rest/plan', async (req, res) => { // Change the route path
        try {
          // Call the middleware before the controller
          await updatePlanStatusesMiddleware(req, res);
      
          // Call the planStatus controller
          await plan.planStatus(req, res);
      
          // Call the middleware after the controller
          await updatePlanStatusesMiddleware(req, res);
        } catch (error) {
          console.error('Error occurred:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      
      // client-plan  
      app.post('/rest/update/plan/status', async (req, res) => {
        updateClientPlanHistory(req, res);
      });

      
    // Validation API
    app.post("/rest/validation/check_number" , auth.checkMobile );
    app.post("/rest/validation/checkuser", authenticate, auth.checkUser);
    app.post("/rest/validation/check_doctor",authenticate ,validation.checkIfDoctorExists);
    app.post("/rest/validation/check_medical_center",authenticate ,validation.checkIfMedicalCenterExists);
    app.post("/rest/validation/check_service_provider", authenticate, validation.checkIfServiceProviderExists);


    //CRUD API
    app.put("/rest/update_number", authenticate,  updateNum.updateNumber);
    app.post("/rest/create_user",  authenticate, createStaff.createUser);

    //Notification API
    app.post('/rest/notification', processData, notify);

    //Images API
    app.post("/rest/files/upload/:type/:ref_id", file.single("image"),  (req, res, next ) => {
        let data = {}
        if(req.file) {
            data.image = req.file.location
        }
        res.status(200).json({
            success: true,
            data: data,
          });
      
    });

    // filter dropdown list 
    app.post("/rest/filter/carebuddy", authenticate_with_cb,  task.carebuddyFilterList);
    app.post("/rest/filter/member", authenticate_with_cb,  task.memberFilterList);
    app.post("/rest/filter/city",  authenticate, member.localityList);

}
