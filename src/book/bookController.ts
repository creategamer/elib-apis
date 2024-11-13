import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs'

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

        // @ts-ignore
        console.log('userId:',req.userId)

        const newBook=await bookModel.create({
            title,
            genre,
            author:'6733a8d58d24f9b2011fa2db',
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

export {createBook}