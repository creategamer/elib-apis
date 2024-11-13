import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRoutes from './user/userRoutes';
import bookRoutes from './book/bookRouter';
import { config } from './config/config';

const app=express()

app.use(cors({
    origin:config.frontendDomain,
}))
//get for json data in postman
app.use(express.json())

//Routes

//https methods
app.get('/',(req,res,next)=>{
    res.json({message:"Welcome to elib apis"})
})

//routes 
app.use('/api/users',userRoutes)
app.use('/api/books',bookRoutes)


//api handling using https
app.use(globalErrorHandler)



export default app