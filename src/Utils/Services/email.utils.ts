import nodemailer from "nodemailer"
import { IEmailArgument } from "../../Common"
import 'dotenv/config';


export const sendEmail = async(
    {
        to,
        cc = 'tarekmohamed@email.com',
        subject,
        content,
        attachments = []
    }: IEmailArgument
)=>{

    const transporter =  nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure : true,
    auth :{
        user : process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    },
     tls: {
    rejectUnauthorized: false
  }
})

    const info = await transporter.sendMail({
        from : `No-reply <${process.env.USER_EMAIL}>`,
        to,
        cc,
        subject,
        html:content,
        attachments

    })

    return info
}


import { EventEmitter } from 'node:events';
export const localEmitter = new EventEmitter();


localEmitter.on('sendEmail' , (args: IEmailArgument)=>{
    sendEmail(args)
})
