// controllers/userController.js
const UserService = require('../services/UserService');

// Create User
const createUser = async (req, res) => {
    try {
        // The service now handles checking existing users, hashing, and DB saving
        const { user, token } = await UserService.createUser(req.body);
        
        return res.status(201).json({
            message: 'User created successfully',
            token, // We include the JWT token so they are logged in immediately
            user
        });
    } catch (error) {
        console.error('Error creating user:', error.message || error);
        // If the service throws our specific 'Email already exists' error, send a 400
        const statusCode = error.message === 'Email already exists' ? 400 : 500;
        return res.status(statusCode).json({ 
            message: error.message || 'Error creating user'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await UserService.loginUser(email, password);
        res.status(200).json({ status: 'success', token, data: user });
    } catch (error) {
        res.status(401).json({ status: 'error', message: error.message });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();

        if (!users || !users.length) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get User By ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await UserService.getUserById(id);
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        const statusCode = error.message === 'User not found' ? 404 : 500;
        return res.status(statusCode).json({ message: error.message || 'Error fetching user' });
    }
};

// Update User
const updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        // We pass the entire req.body to the service, which safely updates only what is provided
        const updatedUser = await UserService.updateUser(id, req.body);

        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error.message);
        const statusCode = error.message === 'User not found' ? 404 : 500;
        return res.status(statusCode).json({ message: error.message || 'Error updating user' });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Triggers the soft delete in the service
        await UserService.deleteUser(id);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        const statusCode = error.message === 'User not found' ? 404 : 500;
        return res.status(statusCode).json({ message: error.message || 'Error deleting user' });
    }
};

// ==========================================
// EXPORT ALL FUNCTIONS AT ONCE
// ==========================================
module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};