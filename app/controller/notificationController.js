
const admin = require('firebase-admin');
const pool = require('../../config/db');
const serviceAccount = require('../../config/firebase_config.json');


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const notify = async (req, res) => {
  try {
    const { user_id, event_type, ref_id } = req.body;
    const { processedData } = req;

    const { rows } = await pool.query('SELECT reg_id FROM notification_devices WHERE user_id = $1 AND is_not_expired = true', [user_id]);
    const registrationTokens = rows.map((row) => row.reg_id);

    if (registrationTokens.length === 0) {
      return res.status(404).json({ message: 'Registration IDs not found' });
    }

    const messages = [];
    const invalidTokens = [];

    const generateNotificationMessage = (event, processedData) => {
      let title = '';
      let message = '';
      switch (event) {
        // Cases for different events
        case 'assign_member':
          title = 'NEW MEMBER ';
          message = `You have been assigned a new member ${processedData.memberName} by ${processedData.userName}.`;
          break;

        case 'update_member_details':
          title = 'MEMBER DETAILS ';
          message = `Your member ${processedData.memberName}  details have been updated by the ${processedData.userName}.`;
          break;

        case 'switch_member':
          title = 'MEMBER SWITCHED';
          message = `Your member has been switched to a new care buddy ${processedData.carebuddy_id}.`;
          break;

        // notification for tasks
        case 'created_task':
          title = 'NEW TASK ';
          message = `You have a new task ${processedData.taskName} assigned by ${processedData.userName}.`;
          break;

        case 'updated_task':
          title = 'TASK UPDATED';
          message = `Your task ${processedData.taskName} is updated by ${processedData.userName}.`;
          break;

        // notification for interactions
        case 'created_interaction':
          title = 'NEW INTERACTION';
          message = `You have a new interaction ${processedData.interactionTitle} assigned by ${processedData.userName}.`;
          break;

        case 'updated_interaction':
          title = 'INTERACTION UPDATED';
          message = `Your interaction ${processedData.interactionTitle} is updated by ${processedData.userName}.`;
          break;

        default:
          title = 'DEFAULT TITLE';
          message = 'Default notification message.';
      }
      return { title, message };
    };

    registrationTokens.forEach((token) => {
      const { title, message } = generateNotificationMessage(event_type, processedData);
      const notification = {
        notification: {
          title: title,
          body: message,
        },
        data: {
          ref_id:'' + ref_id,
          type: event_type,
        },
        token: token,
      };
      messages.push(notification);
    });

    const responses = await Promise.allSettled(messages.map((message) => admin.messaging().send(message)));

    console.log('responses: ', responses);

    responses.forEach((response, index) => {
      if (response.status === 'rejected') {
        invalidTokens.push(registrationTokens[index]);
      }
    });

    if (invalidTokens.length > 0) {
      await pool.query('UPDATE notification_devices SET is_not_expired = false WHERE reg_id = ANY($1)', [invalidTokens]);
    }

    res.status(200).json({ message: 'Notifications sent successfully', reg_id: registrationTokens });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = notify;
