import { config as conf } from "dotenv"
import { env } from "process";

conf()

const _config={
    port:process.env.PORT,
    databaseUrl:process.env.MONGO_CONNECTION_STRING,
    env:process.env.NODE_ENV,
    jwtSecret:process.env.JWT_SECRET,
    coudinary_cloud:process.env.CLOUDINARY_CLOUD,
    coudinaryApikey:process.env.CLOUDINARY_API_KEY,
    coudinaryApiSecret:process.env.CLOUDINARY_API_SECRET,
    
};


export const config=_config