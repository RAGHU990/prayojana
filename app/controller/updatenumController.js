
const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = require('../../config/firebase_config.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


exports.updateNumber = async (req, res) => {


  const { user_id, mobile_number } = req.body;

  try {
    const hgeEndpoint = process.env.HGE_ENDPOINT;
    const adminSecret = process.env.ADMIN_SECRET;

    // Update mobile number in Hasura
    const hasuraUpdateResponse = await axios.post(
      hgeEndpoint,
      {
        query: `
          mutation UpdateMobileNumber($user_id: Int!, $mobile_number: String!) {
            update_users(
              where: { id: { _eq: $user_id } },
              _set: { mobile_number: $mobile_number }
            ) {
              affected_rows
            }
          }
        `,
        variables: {
          user_id,
          mobile_number,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': adminSecret,
        },
      }
    );

    if (hasuraUpdateResponse.data.data.update_users.affected_rows > 0) {
      // Create user in Firebase
      const userRecord = await admin.auth().createUser({
        phoneNumber: mobile_number,
      });

      const new_uid = userRecord.uid;

      // Update UID and mobile number in Hasura
      const hasuraFinalUpdateResponse = await axios.post(
        hgeEndpoint,
        {
          query: `
            mutation UpdateMobileNumberAndUID($user_id: Int!, $mobile_number: String!, $new_uid: String!) {
              update_users(
                where: { id: { _eq: $user_id } },
                _set: { mobile_number: $mobile_number, uid: $new_uid }
              ) {
                affected_rows
              }
            }
          `,
          variables: {
            user_id,
            mobile_number,
            new_uid,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': adminSecret,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Mobile number and UID updated successfully.',
      });
    }

    return res.status(400).json({
      success: false,
      error: 'User not found or mobile number update failed.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

}

