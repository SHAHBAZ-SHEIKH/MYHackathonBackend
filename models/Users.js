import mongoose from 'mongoose';
// import validator from 'validator';

const register  = mongoose.Schema(
    {
        cnic: {
            type: String,
            required: [true, 'Please Add CNIC'],
            unique: true,
            sparse: true, 
            
        },
        email: {
            type: String,
            required: [true, 'Please Add Email'],
        },
        name: {
            type: String,
            required: [true, 'Please Add Name'],
        },
        password: {
            type: String,
            required: [true, 'Please Add Password'],
        },
        isPasswordChange: {
            type: Boolean,
            default: false,
        },
        loanRequest: {
            type: Array,
            default: [], // Ensure loanRequest is initialized
        },
        role: {
            type: String,
            default: "user",
        },
        city: {
            type: String,
            default: "Not Provided", // Default value
        },
        country: {
            type: String,
            default: "Not Provided", // Default value
        },
        address: {
            type: String,
            default: "Not Provided", // Default value
        },
        phone: {
            type: String,
            default: "Not Provided", // Default value
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Users', register);