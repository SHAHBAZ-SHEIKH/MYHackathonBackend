import mongoose from 'mongoose';
// import validator from 'validator';

const register = mongoose.Schema(
    {
        Cnic: {
            type: String,
            required: [true, 'Please Add First Name'],
            unique: true
            
        },
        email: {
            type: String,
            required: [true, 'Please Add Last Name'],
            
        },
        
        
        password: {
            type: String,
            required: [true, 'Please Add Password'],
            
        },
        isPasswordChange: {
            type: Boolean, // Corrected the type definition
            default: false, // Default value
          },
        loanRequest:{
            type:Array
        }
        
        // PasswordResetToken: {
        //     type: String,
        //     required: [true, 'Please Add Password'],
        //     minlength: 8,
        //     trim: true,
        // },
        
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Users', register);