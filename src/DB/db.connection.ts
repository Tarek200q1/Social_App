import mongoose from "mongoose";


export async function dbConnection () {
    try {
        await mongoose.connect(process.env.DB_URL_LOCAL as string)
        console.log('Database connection');
    } catch (error) {
        console.log(`Error conection to the database: ${error}`);
        
    }
}