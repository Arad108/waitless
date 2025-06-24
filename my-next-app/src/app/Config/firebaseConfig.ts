import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  UserCredential,
  User,
  AuthError
} from "firebase/auth";
import { getDatabase, ref, set, DatabaseReference } from "firebase/database";

interface UserData {
  full_name: string;
  role: 'customer' | 'business_owner' | 'staff';
}

interface BackendResponse {
  message?: string;
  [key: string]: any;
}

const firebaseConfig = {
  apiKey: "AIzaSyAxYeKAEgKKjdF3y4l3sO-KYRmS_GJ7J7k",
  authDomain: "waitless-fb735.firebaseapp.com",
  databaseURL: "https://waitless-fb735-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "waitless-fb735",
  storageBucket: "waitless-fb735.appspot.com",
  messagingSenderId: "445166952160",
  appId: "1:445166952160:web:3876650df225410c443a85",
  measurementId: "G-5K554XEZGE"
};

// Initialize Firebase outside of any function
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

const auth = getAuth(app);
const database = getDatabase(app);

const registerUser = async (
  email: string, 
  password: string, 
  additionalData: UserData
): Promise<User> => {
  let userCredential: UserCredential;
  let user: User;

  try {
    // Validate inputs before proceeding
    if (!email || !password || !additionalData.full_name || !additionalData.role) {
      throw new Error("Missing required registration fields");
    }

    console.log('Starting Firebase registration...', { email, ...additionalData });
    
    // Create user in Firebase Authentication
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;

    console.log('User created in Firebase Auth:', user.uid);

    // Create reference and save data atomically
    const userRef: DatabaseReference = ref(database, `users/${user.uid}`);
    const userData = {
      email: user.email,
      ...additionalData,
      created_at: new Date().toISOString()
    };

    await set(userRef, userData);
    console.log('User data saved to Realtime Database');

    // Backend registration
    const backendResponse = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        ...additionalData
      })
    });

    const responseData = await backendResponse.json() as BackendResponse;

    if (!backendResponse.ok) {
      // Log the error details for debugging
      console.error('Backend registration failed:', responseData);
      
      // Clean up Firebase user if backend registration fails
      if (user) {
        try {
          await user.delete();
          console.log('Firebase user deleted after backend registration failure');
        } catch (deleteError) {
          console.error('Failed to delete Firebase user after backend registration failure:', deleteError);
        }
      }
      
      throw new Error(responseData.message || `Backend registration failed with status ${backendResponse.status}`);
    }

    console.log('User successfully registered in backend');
    return user;

  } catch (error) {
    // Handle specific Firebase Auth errors
    if ((error as AuthError).code) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email is already registered');
        case 'auth/invalid-email':
          throw new Error('Invalid email format');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled. Please contact support.');
        case 'auth/weak-password':
          throw new Error('Password is too weak');
        default:
          throw error;
      }
    }
    console.error("Registration Error:", error);
    throw error;
  }
};

export { auth, database, registerUser };
export type { UserData, BackendResponse };