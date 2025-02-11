import express from "express";
import { deleteLoan,getAllLoan, getLoan, loanRequest, updateLoan, updateStatus } from "../controller/loanController.js";
import { verifyTokenAndAdmin } from "../helpers/token.js";

const loanRoutes = express.Router();

loanRoutes.post('/loanrequest', loanRequest)

loanRoutes.get("/",getAllLoan)
loanRoutes.delete("/:id",verifyTokenAndAdmin, deleteLoan);
loanRoutes.put("/:id",verifyTokenAndAdmin,updateLoan);
loanRoutes.get("/find/:id",verifyTokenAndAdmin,getLoan);
loanRoutes.put("/status/:id",verifyTokenAndAdmin,updateStatus)

export default loanRoutes;