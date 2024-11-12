import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt'


const createUser=async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password}=req.body

    //validation
    if (!name||!email||!password) {
        const error=createHttpError(400,"All fields are required")
        return next(error)
    }

    //Database call check user is exits or not 
    const user=await userModel.findOne({email})

    //password ==>hashed   
    const hashedPassword=await bcrypt.hash(password,10)

    if (user) {
        const error=createHttpError(400,"User already exits with this email")
        return next(error)
    }

    //logic
    //response
    res.json({message:"user created successfuly"})
}

export {createUser}