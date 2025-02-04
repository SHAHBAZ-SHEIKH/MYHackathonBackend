import Loan from "../models/Loan.js";
import Users from "../models/Users.js";
import { sendSuccess, sendError } from "../utils/responses.js";
import Appointment from "../models/Appointment.js";

export const loanRequest = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  try {
    const { userId, loanAmount, loanDuration, loanCategory, loanSubCategory, depositAmount, witness, address, phone, city, country } = req.body;

    // Validate required fields
    if (!userId || !loanAmount || !loanDuration || !loanCategory || !loanSubCategory || !depositAmount || !witness || !address || !phone || !city || !country) {
      return res.status(400).send({ status: false, message: "All fields are required." });
    }

    // Step 1: Save Loan Request
    const loan = new Loan({
      loanAmount,
      loanDuration,
      loanCategory,
      loanSubCategory,
      userId,
      depositAmount,
      witness,
    });

    const savedLoan = await loan.save();

    // Step 2: Update User's Personal Information & Loan Requests
    await Users.findByIdAndUpdate(userId, {
      $set: { address, phone, city, country },
      $push: { loanRequest: savedLoan._id }
    }, { new: true });

    // Step 3: Generate Appointment Details
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 7) + 1); // Random date within next 7 days

    const officeLocations = ["Karachi Office", "Lahore Office", "Islamabad Office"];
    const office = officeLocations[Math.floor(Math.random() * officeLocations.length)]; // Random office selection

    const appointmentTimes = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
    const time = appointmentTimes[Math.floor(Math.random() * appointmentTimes.length)]; // Random time selection

    const appointment = new Appointment({
      userId,
      loanId: savedLoan._id,
      appointmentDate,
      office,
      time
    });

    const savedAppointment = await appointment.save();

    // Response
    return res.status(201).send({
      status: true,
      message: "Loan request submitted successfully. Appointment details generated.",
      data: {
        loan: savedLoan,
        appointment: savedAppointment
      }
    });

  } catch (error) {
    console.error("Error in loanRequest:", error);
    return res.status(500).send({ status: false, message: "An error occurred while processing the loan request." });
  }
};





export const getAllLoan= async(req,res)=>{
  try {
    const getAllLoan = await Loan.find();
    res.status(200).json(getAllLoan);
} catch (error) {
    res.status(500).send(error);
    
}

}


// // @desc    DeleteLoan
// // @route   delete api/loan/:id
// // @access  Public

export const deleteLoan = async(req,res,next)=>{
    
  try {
      await Loan.findByIdAndDelete(req.params.id)
      await Appointment.findByIdAndDelete(req.params.id)
      return res.status(200).json("Loan Has been Deleted Successfully")
      
  } catch (error) {
     return res.status(500).json(error)
      
  }
}


// // @desc    UpdateLoan
// // @route   Put api/loan/:id
// // @access  Public


export const updateLoan = async(req,res,next)=>{
  try {
      const updateLoan = await Loan.findByIdAndUpdate(req.params.id, 
          {$set:req.body} ,{new:true} )
      return res.status(200).json(updateLoan)
      
  } catch (error) {
     return res.status(500).json(error)
      
  }

}

// // @desc    GetLoan
// // @route   Get api/loan/find/:id
// // @access  Public


export const getLoan = async(req,res,next)=>{
  try {
      const getLoan = await Loan.findById(req.params.id )
      return res.status(200).json(getLoan)
      
  } catch (error) {
     return res.status(500).json(error)
      
  }
}

