import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs'
import { AuthRequest } from "../middlewares/authentication";

const createBook=async(req:Request,res:Response,next:NextFunction)=>{
    
    const {title,genre,}=req.body;
    // console.log("files",req.files);

    const files=req.files as {[filename:string]:Express.Multer.File[]}
    
    // application/pdf
    const coverImageMimeType=files.coverImage[0].mimetype.split('/').at(-1);

    const fileName=files.coverImage[0].filename

    const filePath=path.resolve(__dirname,'../../public/data/uploads',fileName)

    try {
        const uploadResult=await cloudinary.uploader.upload(filePath,{
            filename_override:fileName,
            folder:'book-covers',
            format:coverImageMimeType,
            
        })
    
        const bookFileName=files.file[0].filename;
        const bookFilePath=path.resolve(__dirname,'../../public/data/uploads',bookFileName)
    
        const bookFileUploadResult=await cloudinary.uploader.upload(bookFilePath,{
            resource_type:'raw',
            filename_override:bookFileName,
            folder:'book-pdfs',
            format:'pdf'
        })
    
        // console.log('bookFileUploadResult:',bookFileUploadResult)
        // console.log('uploaded result:',uploadResult);

        const _req=req as AuthRequest

        const newBook=await bookModel.create({
            title,
            genre,
            author:_req.userId,
            coverImage:uploadResult.secure_url,
            file:bookFileUploadResult.secure_url
        })


        try {
            //Delete temp.files
            await fs.promises.unlink(filePath)
            await fs.promises.unlink(bookFilePath)
        } catch (error) {
            console.log('error on file.txt store the data::')   
        }

        res.status(201).json({id:newBook._id})
    } catch (error) {
        console.log(error)
        return next(createHttpError(500,'Error while uploading the files.'))
    }

}

//update Books
const updateBook=async(req:Request,res:Response,next:NextFunction)=>{
    const {title,genre}=req.body;
    const bookId=req.params.bookId;

    const book=await bookModel.findOne({_id:bookId})
    if (!book) {
        return next(createHttpError(404,'Book not found'))
    }

    //check access 
    const _req=req as AuthRequest
    if (book.author.toString()!==_req.userId) {
        return next(createHttpError(403,'You can update others books'))
    }

    //check if image filed is exists.
    let completeCoverImage='';

    const files=req.files as {[filename:string]:Express.Multer.File[]}
    if (files?.coverImge) {
        const filename=files.coverImage[0].filename;
        const coverMimeType=files.coverImage[0].mimetype.split('/').at(-1);
        
        //send files to cloudinary
        const filePath=path.resolve(__dirname,'../../public/data/uploads',filename)
        
        completeCoverImage=filename
        
        const uploadResult=await cloudinary.uploader.upload(filePath,{
            filename_override:completeCoverImage,
            folder:'book-covers',
            format:coverMimeType
        })

        completeCoverImage=uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    //check if file field is exists.
    let completeFileName=""
    if (files.file) {
        const bookFilePath=path.resolve(__dirname,'../../public/data/uploads',files.file[0].filename)
        
        const bookFileName=files.file[0].filename
        completeFileName=bookFileName

        const uploadResultPdf=await cloudinary.uploader.upload(bookFilePath,{
            resource_type:'raw',
            filename_override:completeFileName,
            folder:'book-pdfs',
            format:'pdf'
        });

        completeFileName=uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath)
    }
    
    //updateBook using mongoodb
    const updateBook=await bookModel.findOneAndUpdate(
        {
            _id:bookId,
        },
        {
            title:title,
            genre:genre,
            coverImage:completeCoverImage ? completeCoverImage : book.coverImage,
            file:completeFileName ? completeFileName : book.file,
        },
        {new:true}
    );

    res.json(updateBook)
}

//all books
const listBooks=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        //todo:pachinations 
        const book=await bookModel.find()

        res.json(book)
    } catch (error) {
        return next(createHttpError(500,'Error while a getting a books'))
    }
}

const getSingleBook=async(req:Request,res:Response,next:NextFunction)=>{
    
    const bookId=req.params.bookId
    
    try {
        const book=await bookModel.findOne({_id:bookId})
        if (!book) {
            return next(createHttpError(404,'book not found'))
        }    
        res.json(book)
    } catch (error) {
        return next(createHttpError(500,'Error while getting a book'))
    }

}

const deleteBook=async(req:Request,res:Response,next:NextFunction)=>{
    const bookId=req.params.bookId
    
    try {
        const book=await bookModel.findOne({_id:bookId})
        if (!book) {
            return next(createHttpError(404,'book not found'))
        }    
        
        //check access 
        const _req=req as AuthRequest
        if (book.author.toString()!==_req.userId) {
            return next(createHttpError(403,'You can update others books'))
        }
        const coverFileSplits=book.coverImage.split('/')
        const coverImagePublicId=coverFileSplits.at(-2)+"/"+coverFileSplits.at(-1)?.split('.').at(-2)
        
        // console.log('coverImagePublicId::',coverImagePublicId)

        const bookFileSplits=book.file.split('/')
        const bookFilePublicId=bookFileSplits.at(-2)+'/'+bookFileSplits.at(-1)
        // console.log('bookFilePublicId::',bookFilePublicId)

        try {
            await cloudinary.uploader.destroy(coverImagePublicId)
            await cloudinary.uploader.destroy(bookFilePublicId,{
                resource_type:'raw'
            })
        } catch (error) {
            return next(createHttpError(401,'destroy the in cloudinary'))    
        }

        try {
            await bookModel.deleteOne({_id:bookId})
            res.sendStatus(204)
        } catch (error) {
            return next(createHttpError(401,'error on deleting the data'))
        }
        
    } catch (error) {
        return next(createHttpError(500,'Error while getting a book'))
    }
}

export {createBook,updateBook,listBooks,getSingleBook,deleteBook}