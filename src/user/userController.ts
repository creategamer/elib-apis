import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt'
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";


//create a user 
const createUser=async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password}=req.body

    //validation
    if (!name||!email||!password) {
        const error=createHttpError(400,"All fields are required")
        return next(error)
    }

    //Database call check user is exits or not 
    try {
        const user=await userModel.findOne({email})
    
        if (user) {
            const error=createHttpError(400,"User already exits with this email")
            return next(error)
        }
    } catch (error) {
        return next(createHttpError(500,'Error while getting user'))
    }
    
    //password ==>hashed   
    const hashedPassword=await bcrypt.hash(password,10)

    let newUser:User

    try {
        newUser=await userModel.create({
            name,
            email,
            password:hashedPassword
        })    
    } catch (error) {
        return next(createHttpError(500,'Error while getting new user'))
    }

    try {
        //Token generations
        const token=sign({sub:newUser._id},config.jwtSecret as string,{expiresIn:"7d"})
    
        //response
        res.status(200).json({ accessToken:token})
    } catch (error) {
        return next(createHttpError(500,'Error while signin jwt tokens'))
    }
}


//login a user
const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password}=req.body
    //validation
    if (!email||!password) {
        const error=createHttpError(400,"All fields are required")
        return next(error)
    }

    const user=await userModel.findOne({email})

    if (!user) {
        return next(createHttpError(404,'user not found'))
    }
    
    //password ==>hashed   
    const isMatch=await bcrypt.compare(password,user.password)
    
    if (!isMatch) {
        return next(createHttpError(400,'username or password is incorrect'))
    }

    //create accessToken
    try {
        //Token generations
        const token=sign({sub:user._id},config.jwtSecret as string,{expiresIn:"7d"})
    
        //response
        res.status(200).json({ accessToken:token})
    } catch (error) {
        return next(createHttpError(500,'Error while signin jwt tokens'))
    }

}


export {createUser,loginUser}