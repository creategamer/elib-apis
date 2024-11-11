import express from 'express'

const app=express()


//Routes

//https methods
app.get('/',(req,res,next)=>{
    res.json({message:"Welcome to elib apis"})
})

export default app