import express from 'express';
 
 import { registerUser, resetPasswordEmail, login } from '../controller/usersController.js';



 export const authRoutes = express.Router();

 authRoutes.post('/signup', registerUser);
 authRoutes.put('/resetPassword', resetPasswordEmail);
 authRoutes.post('/login', login);