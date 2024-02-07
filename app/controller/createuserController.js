
const admin = require('firebase-admin');
const axios = require('axios');

const hgeEndpoint = process.env.HGE_ENDPOINT;
const adminSecret = process.env.ADMIN_SECRET;

// Path to your service account JSON file
const serviceAccount = require('../../config/firebase_config.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.createUser = async (req, res) => {

  const {
    name,
    mobile_number,
    role_id,
    address1,
    city,
    first_name,
    gender,
    profile_photo,
    state,
    whatsapp,
    phone,
    email, 
  } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      phoneNumber: mobile_number,
      email, 
    });

    const userData = {
      mobile_number,
      name,
      role_id,
      uid: userRecord.uid,
      people: {
        data: {
          address1,
          city,
          email,
          first_name,
          gender,
          profile_photo,
          state,
          whatsapp,
          phone,
        },
      },
    };

    const graphqlResponse = await axios.post(
      hgeEndpoint,
      {
        query: `
          mutation InsertUserWithPeople($object: users_insert_input!) {
            insert_users_one(object: $object) {
              id
              mobile_number
              name
              role_id
              people {
                address1
                city
                email
                first_name
                gender
                id
                phone
                profile_photo
                whatsapp
                user_id
              }
            }
          }
        `,
        variables: {
          object: userData,
        },
      },
      {
        headers: {
          'x-hasura-admin-secret': adminSecret,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

    res.status(200).json({
      success: true,
      graphqlResponse: graphqlResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }

};
