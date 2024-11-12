import express, { NextFunction, Request, Response } from 'express'
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRoutes from './user/userRoutes';
import bookRoutes from './book/bookRouter';

const app=express()

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