import express from 'express'
import { createBook } from './bookController'

const bookRoutes=express.Router()

//routes
bookRoutes.post('/',createBook)


export default bookRoutes