import express, { NextFunction, Request, Response } from 'express'
import globalErrorHandler from './middlewares/globalErrorHandler';

const app=express()


//Routes

//https methods
app.get('/',(req,res,next)=>{
    res.json({message:"Welcome to elib apis"})
})

app.use(globalErrorHandler)



export default app