import express from 'express';
 
 import { registerUser, resetPasswordEmail, login, getAllUsers, getUser, deleteUser, updateUser,forgotPasswordEmail } from '../controller/usersController.js';
import { validateToken, verifyTokenAndAdmin } from '../helpers/token.js';



 export const authRoutes = express.Router();

 authRoutes.post('/signup', registerUser);
 authRoutes.put('/resetPassword', resetPasswordEmail);
 authRoutes.post('/login', login);
 authRoutes.get("/",verifyTokenAndAdmin,getAllUsers)
 authRoutes.get("/find/:id",verifyTokenAndAdmin,getUser)
 authRoutes.delete("/:id",verifyTokenAndAdmin,deleteUser)
 authRoutes.put("/:id",verifyTokenAndAdmin,updateUser)
 authRoutes.post('/forgotPassword', forgotPasswordEmail);