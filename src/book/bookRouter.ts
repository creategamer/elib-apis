import express from 'express'
import { createBook, deleteBook, getSingleBook, listBooks, updateBook } from './bookController'
import multer from 'multer'
import path from 'node:path'
import authenticate from '../middlewares/authentication'

const bookRoutes=express.Router()

//file store local
const upload=multer({
    dest:path.resolve(__dirname,'../../public/data/uploads'),
    limits:{fileSize:3e7}
})

//routes
bookRoutes.post('/',authenticate,upload.fields([
    {name:'coverImage',maxCount:1},
    {name:'file',maxCount:1}
]),createBook)


bookRoutes.patch('/:bookId',authenticate,upload.fields([
    {name:'coverImage',maxCount:1},
    {name:'file',maxCount:1}
]),updateBook)


bookRoutes.get('/',listBooks)

bookRoutes.get('/:bookId',getSingleBook)

bookRoutes.delete('/:bookId',authenticate,deleteBook)

export default bookRoutes