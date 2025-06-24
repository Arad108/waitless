const { db } = require('../utils/firebaseConfig'); // Assuming db is Firestore

class BusinessService {
    constructor() {
        this.db = db;
        this.businessRef = db.collection('businesses');
    }

    // Create a new business
    async createBusiness(name, address, ownerId) {
        try {
            // Check if the business name already exists
            const existingBusiness = await this.businessRef
                .where('name', '==', name)
                .get();

            if (!existingBusiness.empty) {
                throw new Error('Business name already exists');
            }

            // Add new business to Firestore
            const businessDoc = await this.businessRef.add({
                name,
                address,
                ownerId,
                createdAt: new Date(),
            });

            // Return the newly created business
            return {
                id: businessDoc.id,
                name,
                address,
                ownerId,
                createdAt: new Date(),
            };
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }

    // Get all businesses
    async getAllBusinesses() {
        try {
            const snapshot = await this.businessRef.get();
            if (snapshot.empty) {
                return [];
            }

            const businesses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return businesses;
        } catch (error) {
            console.error('Error fetching all businesses:', error);
            throw error;
        }
    }

    // Get a business by its ID
    async getBusinessById(businessId) {
        try {
            const businessDoc = await this.businessRef.doc(businessId).get();

            if (!businessDoc.exists) {
                throw new Error('Business not found');
            }

            return {
                id: businessDoc.id,
                ...businessDoc.data(),
            };
        } catch (error) {
            console.error(`Error fetching business with ID ${businessId}:`, error);
            throw error;
        }
    }

    // Update a business's details
    async updateBusiness(businessId, name, address, ownerId) {
        try {
            // Check if the business name already exists (excluding the current business)
            const existingBusiness = await this.businessRef
                .where('name', '==', name)
                .get();

            if (!existingBusiness.empty && existingBusiness.docs[0].id !== businessId) {
                throw new Error('Business name already exists');
            }

            // Update the business in Firestore
            const businessDoc = await this.businessRef.doc(businessId).update({
                name,
                address,
                ownerId,
                updatedAt: new Date(),
            });

            // Return the updated business
            return {
                id: businessId,
                name,
                address,
                ownerId,
                updatedAt: new Date(),
            };
        } catch (error) {
            console.error(`Error updating business with ID ${businessId}:`, error);
            throw error;
        }
    }

    // Soft delete a business (mark as deleted)
    async deleteBusiness(businessId) {
        try {
            // Soft delete the business by adding a deletedAt field
            const businessDoc = await this.businessRef.doc(businessId).update({
                deletedAt: new Date(),
            });

            return {
                id: businessId,
                deletedAt: new Date(),
            };
        } catch (error) {
            console.error(`Error deleting business with ID ${businessId}:`, error);
            throw error;
        }
    }
}

module.exports = BusinessService;
