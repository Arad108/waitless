const { db, auth } = require('../utils/firebaseConfig');
const bcrypt = require('bcrypt');

class UserService {
    constructor() {
        this.db = db;
    }

    // Create a new user
    async createUser(fullName, email, password, role = 'customer') {
        try {
            if (!fullName || !email || !password) {
                throw new Error('Missing required fields: fullName, email, and password are required');
            }

            // Hash the password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user in Firebase Authentication
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: fullName,
            });

            console.log('Firebase user created:', userRecord.uid);

            // Store additional user data in Realtime Database
            const userRef = this.db.ref(`users/${userRecord.uid}`);
            await userRef.set({
                fullName,
                email,
                passwordHash,
                role,
                createdAt: Date.now(),
            });

            console.log('User data stored in Realtime Database');

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                fullName,
                role,
            };
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'auth/email-already-exists') {
                throw new Error('Email already exists');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Get a user by email
    async getUserByEmail(email) {
        try {
            const snapshot = await this.db.ref('users').orderByChild('email').equalTo(email).once('value');

            if (!snapshot.exists()) {
                throw new Error('User not found');
            }

            const userId = Object.keys(snapshot.val())[0];
            const user = snapshot.val()[userId];

            return { ...user, uid: userId };
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Update user details
    async updateUser(uid, updates) {
        try {
            if (!uid || !updates) {
                throw new Error('Missing required fields: uid and updates are required');
            }

            // Update user data in Realtime Database
            const userRef = this.db.ref(`users/${uid}`);
            await userRef.update({
                ...updates,
                updatedAt: Date.now(),
            });

            console.log('User updated successfully');
            return { uid, ...updates };
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete (soft delete) a user
    async deleteUser(uid) {
        try {
            if (!uid) {
                throw new Error('Missing required field: uid');
            }

            // Mark user as deleted in Realtime Database
            const userRef = this.db.ref(`users/${uid}`);
            await userRef.update({
                deletedAt: Date.now(),
            });

            console.log('User soft-deleted successfully');
            return { uid, deletedAt: Date.now() };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get all active users
    async getAllUsers() {
        try {
            const snapshot = await this.db.ref('users').once('value');
            if (!snapshot.exists()) {
                return [];
            }

            const users = snapshot.val();
            const activeUsers = Object.keys(users)
                .filter((uid) => !users[uid].deletedAt)
                .map((uid) => ({ uid, ...users[uid] }));

            return activeUsers;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Verify password for login
    async verifyPassword(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
            return isPasswordCorrect;
        } catch (error) {
            console.error('Error verifying password:', error);
            throw new Error(`Error verifying password: ${error.message}`);
        }
    }
}

module.exports = UserService;
