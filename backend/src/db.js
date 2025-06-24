const admin = require('firebase-admin');
const serviceAccount = require(`../src/utils/serviceAccountKey.json`);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You don't need the databaseURL for Firestore
});

// Get a reference to the Firestore database
const db = admin.firestore();

// Test Firestore connection
const testConnection = async () => {
  try {
    const snapshot = await db.collection('users').get();  // Reference to the 'users' collection in Firestore

    // If no users data is found, add a default user document to the 'users' collection
    if (snapshot.empty) {
      console.log('No users data found in Firestore.');
      
      // Create a default user if none exists
      await db.collection('users').add({
        name: 'Default User',
        email: 'default@example.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('Default user added to Firestore.');
    } else {
      console.log('Firebase Firestore connection successful. Users data:', snapshot.docs.map(doc => doc.data()));
    }
  } catch (err) {
    console.error('Firestore initialization error:', err);
  }
};

testConnection();

// Export Firestore reference for use in other parts of the backend
module.exports = {db};
