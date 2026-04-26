// src/services/AppointmentService.js
const mongoose = require('mongoose');
const Appointment = require('../models/appointmentModel');
const Business = require('../models/businessModel');
const Service = require('../models/serviceModel');

const convertToObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch (error) {
        throw new Error('Invalid ID format');
    }
};

class AppointmentService {
    // Schedule a new appointment
    async scheduleAppointment(appointmentData) {
        try {
            const {
                businessId,
                facilityId,
                serviceId,
                appointmentTime,
                customerName,
                customerEmail,
                customerPhone,
                status = 'scheduled',
                notes = '',
                userId = null
            } = appointmentData;

            // Use businessId or facilityId
            const actualBusinessId = businessId || facilityId;
            console.log(`Scheduling appointment for businessId: ${actualBusinessId}`);

            // Convert string ID to ObjectId
            const businessObjectId = convertToObjectId(actualBusinessId);

            // Find the business
            const business = await Business.findById(businessObjectId);
            if (!business) {
                console.error(`Business not found for ID: ${actualBusinessId}`);
                throw new Error('Business not found');
            }

            console.log('Found business:', business.name);

            // Find or create service
            let actualServiceId;
            if (typeof serviceId === 'object' && serviceId.name) {
                const service = await Service.findOneAndUpdate(
                    { 
                        name: serviceId.name,
                        businessId: businessObjectId 
                    },
                    { 
                        name: serviceId.name,
                        businessId: businessObjectId,
                        durationMinutes: 60,
                        price: 0
                    },
                    { upsert: true, new: true }
                );
                actualServiceId = service._id;
            } else {
                actualServiceId = convertToObjectId(serviceId);
            }

            // Check for conflicts
            const appointmentDateTime = new Date(appointmentTime);
            const service = await Service.findById(actualServiceId);
            if (!service) {
                throw new Error('Service not found');
            }

            const appointmentEndTime = new Date(appointmentDateTime);
            appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + service.durationMinutes);

            const conflicts = await Appointment.findConflicts(
                businessObjectId,
                appointmentDateTime,
                appointmentEndTime
            );

            if (conflicts.length > 0) {
                throw new Error('This time slot is not available');
            }

            // Create appointment
            const appointment = new Appointment({
                businessId: businessObjectId,
                serviceId: actualServiceId,
                appointmentTime: appointmentDateTime,
                appointmentEndTime,
                customerDetails: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone
                },
                status,
                notes,
                userId,
                metadata: {
                    source: 'web',
                    paymentStatus: 'pending',
                    reminderSent: false
                }
            });

            console.log('Creating appointment:', {
                business: business.name,
                service: service.name,
                time: appointmentDateTime
            });

            const savedAppointment = await appointment.save();
            console.log('Saved appointment:', savedAppointment._id);

            // Return populated appointment
            return await Appointment.findById(savedAppointment._id)
                .populate('businessId', 'name address contact')
                .populate('serviceId', 'name durationMinutes price')
                .populate('userId', 'full_name email');
        } catch (error) {
            console.error('Error in scheduleAppointment:', error);
            throw new Error(`Error scheduling appointment: ${error.message}`);
        }
    }

    // Get all appointments with filtering
    async getAllAppointments({ status, date, page = 1, limit = 10, userId, role }) {
        try {
            const query = {};

            if (status) {
                query.status = status;
            }

            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                query.appointmentTime = {
                    $gte: startDate,
                    $lt: endDate
                };
            }

            if (role === 'business_owner') {
                query.businessId = userId;
            } else if (role === 'customer') {
                query['customerDetails.email'] = userId;
            }

            const skip = (page - 1) * limit;

            const appointments = await Appointment.find(query)
                .populate('businessId', 'name address contact')
                .populate('serviceId', 'name durationMinutes price')
                .populate('userId', 'full_name email')
                .sort({ appointmentTime: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Appointment.countDocuments(query);

            return {
                appointments,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            };
        } catch (error) {
            throw new Error(`Error getting appointments: ${error.message}`);
        }
    }

    // Get upcoming appointments
    async getUpcomingAppointments(userId, role) {
        try {
            const query = role === 'business_owner' 
                ? { businessId: userId }
                : { 'customerDetails.email': userId };

            return await Appointment.findUpcoming(query)
                .populate('businessId', 'name address contact')
                .populate('serviceId', 'name durationMinutes price')
                .populate('userId', 'full_name email');
        } catch (error) {
            throw new Error(`Error getting upcoming appointments: ${error.message}`);
        }
    }

    // Update appointment
    async updateAppointment(id, updateData) {
        try {
            const appointmentId = convertToObjectId(id);
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            if (updateData.appointmentTime) {
                const service = await Service.findById(appointment.serviceId);
                const newStartTime = new Date(updateData.appointmentTime);
                const newEndTime = new Date(newStartTime);
                newEndTime.setMinutes(newEndTime.getMinutes() + service.durationMinutes);

                const conflicts = await Appointment.findConflicts(
                    appointment.businessId,
                    newStartTime,
                    newEndTime,
                    appointmentId
                );

                if (conflicts.length > 0) {
                    throw new Error('This time slot is not available');
                }

                updateData.appointmentEndTime = newEndTime;
            }

            if (!appointment.canBeCancelled() && updateData.status === 'cancelled') {
                throw new Error('Cannot cancel appointment less than 24 hours before start time');
            }

            const updatedAppointment = await Appointment.findByIdAndUpdate(
                appointmentId,
                { ...updateData },
                { new: true }
            )
            .populate('businessId', 'name address contact')
            .populate('serviceId', 'name durationMinutes price')
            .populate('userId', 'full_name email');

            return updatedAppointment;
        } catch (error) {
            throw new Error(`Error updating appointment: ${error.message}`);
        }
    }

    // Cancel appointment
    async cancelAppointment(id) {
        try {
            const appointment = await Appointment.findById(convertToObjectId(id));
            
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            if (!appointment.canBeCancelled()) {
                throw new Error('Cannot cancel appointment less than 24 hours before start time');
            }

            return await this.updateAppointment(id, { 
                status: 'cancelled',
                metadata: {
                    ...appointment.metadata,
                    paymentStatus: 'refunded'
                }
            });
        } catch (error) {
            throw new Error(`Error cancelling appointment: ${error.message}`);
        }
    }

    // Get available slots
    async getAvailableSlots(businessId, serviceId, date) {
        try {
            const business = await Business.findById(convertToObjectId(businessId));
            const service = await Service.findById(convertToObjectId(serviceId));

            if (!business || !service) {
                throw new Error('Business or service not found');
            }

            const dayName = new Date(date).toLocaleLowerCase().slice(0, 3);
            const businessHours = business.openingHours[dayName];

            if (!businessHours) {
                return [];
            }

            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            const bookedAppointments = await Appointment.find({
                businessId: convertToObjectId(businessId),
                appointmentTime: { $gte: startDate, $lt: endDate },
                status: { $ne: 'cancelled' }
            });

            const slots = [];
            let currentTime = new Date(`${date}T${businessHours.open}`);
            const closeTime = new Date(`${date}T${businessHours.close}`);

            while (currentTime < closeTime) {
                const slotEnd = new Date(currentTime);
                slotEnd.setMinutes(slotEnd.getMinutes() + service.durationMinutes);

                const hasConflict = bookedAppointments.some(apt => {
                    return (currentTime < apt.appointmentEndTime && slotEnd > apt.appointmentTime);
                });

                if (!hasConflict && slotEnd <= closeTime) {
                    slots.push(currentTime.toISOString());
                }

                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            return slots;
        } catch (error) {
            throw new Error(`Error getting available slots: ${error.message}`);
        }
    }
}

module.exports = new AppointmentService();