import { v4 as uuidv4 } from 'uuid';
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  NOTFOUND,
  OK,
  UNAUTHORIZED,
} from '../constants/httpStatus.js';
import nodemailer from 'nodemailer';
import { sendError, sendSuccess } from '../utils/responses.js';
import { GenerateToken, ValidateToken, VerifyToken } from '../helpers/token.js';
import pkg from 'jsonwebtoken';
const { verify, decode, sign } = pkg;
import { hashSync, genSaltSync, compareSync } from 'bcrypt';


import {
  responseMessages,

} from '../constants/responseMessages.js';
import Users from '../models/Users.js';
const {
  GET_SUCCESS_MESSAGES,
  INVITATION_LINK_UNSUCCESS,
  MISSING_FIELDS,
  MISSING_FIELD_EMAIL,
  NO_USER,
  NO_USER_FOUND,
  PASSWORD_AND_CONFIRM_NO_MATCH,
  PASSWORD_CHANGE,
  PASSWORD_FAILED,
  RESET_LINK_SUCCESS,
  SUCCESS_REGISTRATION,
  UN_AUTHORIZED,
  USER_EXISTS,
  USER_NAME_EXISTS
} = responseMessages;

import { sendEmailOTP } from '../helpers/merayFunction.js';




export const registerUser = async (req, res) => {
  console.log(req.body, "===>>> req.body");
  console.log(req.body.cnic)

  try {
      const { email, cnic, name, city, country, phone, address } = req.body;

      if (!email || !cnic || !name) {
          return res.status(BADREQUEST).send(sendError({
              status: false,
              message: "Email, CNIC, and Name are required."
          }));
      }

      console.log("cnic".cnic)

      const existingEmail = await Users.findOne({ email });
      if (existingEmail) {
          return res.status(ALREADYEXISTS).send(sendError({
              status: false,
              message: "Email already exists."
          }));
      }

      const existingCnic = await Users.findOne({ cnic });
      if (existingCnic) {
          return res.status(ALREADYEXISTS).send(sendError({
              status: false,
              message: "CNIC already exists."
          }));
      }

      const generatedPassword = uuidv4().slice(0, 6);

      const newUser = new Users({
          email,
          cnic,
          name,
          password: generatedPassword,
          city: city || "Not Provided",
          country: country || "Not Provided",
          phone: phone || "Not Provided",
          address: address || "Not Provided",
      });

      const savedUser = await newUser.save();

      const token = GenerateToken({ data: savedUser, expiresIn: '24h' });
      await sendEmailOTP(email, generatedPassword);

      return res.status(CREATED).send(sendSuccess({
          status: true,
          message: "User registered successfully. Login details sent via email.",
          data: savedUser,
          token: token,
      }));
  } catch (error) {
      console.error("Error in registerUser:", error);
      return res.status(INTERNALERROR).send(sendError({
          status: false,
          message: "An error occurred. Please try again."
      }));
  }
};





export const resetPasswordEmail = async (req, res) => {
  console.log("resetPasswordEmail controller");

  try {
    const { newPassword, confirmNewPassword, token } = req.body;

    // Validate inputs
    if (!newPassword || !confirmNewPassword || !token) {
      return res
        .status(BADREQUEST)
        .send(sendError({ status: false, message: "Missing required fields." }));
    }

    // Check if newPassword matches confirmNewPassword
    if (newPassword !== confirmNewPassword) {
      return res
        .status(BADREQUEST)
        .send(sendError({ status: false, message: "Passwords do not match." }));
    }

    // Verify token and extract user ID
    const { result } = verify(token, process.env.JWT_SECRET_KEY);
    const userId = result._id;

    // Find user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(NOTFOUND)
        .send(sendError({ status: false, message: "User not found." }));
    }

    // Hash the new password
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(newPassword, salt);

    // Update user's password and isPasswordChange flag
    await Users.findByIdAndUpdate(userId, {
      $set: { password: hashedPassword, isPasswordChange: true },
    });

    // Exclude password from the response
    const updatedUser = await Users.findById(userId).lean();
    delete updatedUser.password; // Remove the password field

    // Respond with success
    return res.status(OK).send(
      sendSuccess({
        status: true,
        message: "Password updated successfully.",
        data: updatedUser, // Include user data except the password
      })
    );
  } catch (error) {
    console.error("Error in resetPasswordEmail:", error.message);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: "An internal error occurred.",
      })
    );
  }
};




export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      // return res.send("login controller")

      let user = await Users.findOne({ email: email });
      console.log(user);
      if (user) {



        if (user.email === email) {

          const token = GenerateToken({ data: user, expiresIn: '24h' });
          res.cookie('token', token, { httpOnly: true });
          res.status(OK).send(
            sendSuccess({
              status: true,
              message: 'Login Successful',
              token,
              data: user,
            })
          );
        } else {
          return res
            .status(OK)
            .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
        }
      } else {
        return res
          .status(NOTFOUND)
          .send(sendError({ status: false, message: responseMessages.NO_USER }));
      }
    } else {
      return res
        .status(500) //BADREQUEST
        // .send(sendError({ status: false, message: MISSING_FIELDS }));
        .send("Missing fields");
    }
  } catch (error) {
    return res.status(500)   //INTERNALERROR
      .send(error)
      .send(
        sendError({
          status: false,
          message: error.message,
          data: null,
        })
      );
  }
};



// // @desc    forgotPasswordEmail
// // @route   GET api/auth/forgotPasswordEmail
// // @access  Public

export const forgotPasswordEmail = async (req, res) => {
    console.log("forgotPasswordEmail controller",req.body.email)
    try {
        const { email } = req.body;
        if (email) {
            const user = await Users.findOne({
                email: email,
            });

            console.log(user, "===>> user")
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                // console.log(user, "===>> user")
                // console.log(user._id, "===>> userId")
                // console.log(process.env.JWT_SECRET_KEY, "===>> secretKey")
                const token = GenerateToken({ data: secret, expiresIn: '30m' });
                // return res.send(token)
                const link = `http://localhost:5173/change-password/${user._id}/${token}`;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.PORTAL_EMAIL,
                        pass: process.env.PORTAL_PASSWORD,
                    },
                });

                // const transporter = nodemailer.createTransport({
                //     host: process.env.MAILTRAPHOST,
                //     port: process.env.MAILTRAPPORT,
                //     auth: {
                //         user: process.env.MAILTRAPUSERNAME,
                //         pass: process.env.MAILTRAPPASSWORD,
                //     },
                // });

                const mailOptions = {
                    from: process.env.PORTAL_EMAIL,        //email jis se bhejni ho
                    to: email,         //jisko email bhejni ho
                    subject: 'Reset Password',
                    text: `Please click on the link to reset your password ${link}`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        return res
                            .status(INTERNALERROR)
                            .send(sendError({ status: false, message: error.message }));
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(OK).send(
                            sendSuccess({
                                status: true,
                                message: 'Reset Password Link Generated'
                            })
                        );
                    }
                });
            } else {
                return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER_FOUND }));
            }
        } else {
            return res
                .status(BADREQUEST)
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELD_EMAIL }));
        }
    } catch (error) {
        return res.status(INTERNALERROR).send(
            sendError({
                status: false,
                message: error.message,
                data: null,
            })
        );
    }
};


// // Resend OTP
// export const resendOTP = async (req, res) => {
//     console.log("resendOTP controller");

//     try {
//         const { email } = req.body;

//         // Check if the email is provided
//         if (!email) {
//             return res
//                 .status(BADREQUEST)
//                 .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
//         }

//         // Check if the user exists in the database
//         const user = await Users.findOne({ email: email });
//         console.log(user, "==>> user");

//         if (!user) {
//             return res
//                 .status(NOTFOUND)
//                 .send(sendError({ status: false, message: responseMessages.USER_NOT_FOUND }));
//         }

//         // Generate a new OTP
//         const otp = uuidv4().slice(0, 6);
//         console.log(otp, "==>> new otp generated");

//         // Update the user with the new OTP and expiry time
//         user.otp = otp;
//         user.expiresIn = Date.now() + 300000; // OTP expires in 5 minutes

//         const updatedUser = await user.save();

//         // Send the new OTP via email
//         const emailResponse = await sendEmailOTP(email, otp);

//         if (!emailResponse) {
//             return res
//                 .status(INTERNALERROR)
//                 .send(sendError({ status: false, message: responseMessages.EMAIL_SEND_FAILED }));
//         }

//         // Exclude the password from the response
//         updatedUser.password = undefined;

//         return res.status(OK).send(
//             sendSuccess({
//                 status: true,
//                 message: "OTP sent successfully",
//                 data: updatedUser,
//             })
//         );
//     } catch (error) {
//         console.log(error.message, "==>> error");
//         return res
//             .status(500) // INTERNALERROR
//             .send(sendError({ status: false, message: error.message, error }));
//     }
// };




export const getAllUsers = async (req, res) => {
  try {
    const { country, city } = req.query; // Query parameters lo
    let filter = {};

    if (country) filter.country = country;
    if (city) filter.city = city;

    const users = await Users.find(filter); // Filter apply karo
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};



// // @desc    GetUser
// // @route   Get api/user/find/:id
// // @access  Public


export const getUser = async(req,res,next)=>{
  try {
      const getUser = await Users.findById(req.params.id )
      return res.status(200).json(getUser)
      
  } catch (error) {
     return res.status(500).json(error)
      
  }
}

// // @desc    DeleteUser
// // @route   delete api/user/:id
// // @access  Public

export const deleteUser = async(req,res,next)=>{
    
  try {
      await Users.findByIdAndDelete(req.params.id)
      return res.status(200).json("User Has been Deleted Successfully")
      
  } catch (error) {
     return res.status(500).json(error)
      
  }
}


// // @desc    UpdateUser
// // @route   Put api/user/:id
// // @access  Public


export const updateUser = async(req,res,next)=>{
  try {
      const updateUser = await Users.findByIdAndUpdate(req.params.id, 
          {$set:req.body} ,{new:true} )
      return res.status(200).json(updateUser)
      
  } catch (error) {
     return res.status(500).json(error)
      
  }

}
