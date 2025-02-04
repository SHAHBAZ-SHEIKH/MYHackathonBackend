import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    loanAmount: {
        type: Number,
        required: true,
    },
    loanDuration: {
        type: Number,
        required: true,
    },
    loanCategory: {
        type: String,
        required: true,
    },
    loanSubCategory: {
        type: String,
        required: true,
    },
    userId: {
        type:String,
        required: true
        
    },
    witness:{
        type:Array,
        required:true
        
    },
    depositAmount:{
        type:Number,
        required:true
    },
    loanStatus:{
        type:String,
        default:"Pending"

    }
}, { timestamps: true });

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;