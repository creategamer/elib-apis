import express from 'express'
import { createUser } from './userController'

const userRoutes=express.Router()

//routes
userRoutes.post('/register',createUser)

export default userRoutes