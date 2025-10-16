import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import * as controllers from './Modules/controllers.index'
import { dbConnection } from './DB/db.connection'
import { FailedResponse, HttpExcption } from './Utils'
const app = express()

app.use(express.json())

dbConnection()

app.use('/api/auth' , controllers.authController)
app.use('/api/users' , controllers.profilecontroller)
app.use('/api/posts' , controllers.postController)
app.use('/api/comments' , controllers.commentController)
app.use('/api/reacts' , controllers.reactController)

// Error handilng middleware
app.use((err: HttpExcption | Error | null , req: Request , res: Response , next: NextFunction)=>{
    if(err){
        if(err instanceof HttpExcption){
            res.status(err.statusCode).json(FailedResponse(err.message, err.statusCode, err.error))
        }else{
            res.status(500).json(FailedResponse('Something went wrong', 500, err))
        }
    }
})


const port:number | string = process.env.PORT || 5000
app.listen(port , ()=> {
    console.log("Server is running on port " + process.env.PORT);
})