import express from "express";
import { getAllLoan, loanRequest } from "../controller/loanController.js";

const loanRoutes = express.Router();

loanRoutes.post('/loanrequest', loanRequest)

loanRoutes.get("/",getAllLoan)

export default loanRoutes;