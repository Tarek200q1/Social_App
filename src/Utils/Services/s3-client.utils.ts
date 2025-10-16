import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs, { ReadStream } from 'node:fs'

interface IPutObjectCommandInput extends PutObjectCommandInput {
    Body: string | Buffer | ReadStream
}

export class S3ClientService {
  private s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  private key_folder = process.env.AWS_KEY_FOLDER as string

  async getFileWithSignedUrl(key: string, expiresIn = 60) {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key
    })
    return await getSignedUrl(this.s3Client, getCommand, { expiresIn })
  }

  async uploadFileOnS3(file: Express.Multer.File, key: string) {
    console.log(file);
    

    const keyName = `${this.key_folder}/${key}/${Date.now()}-${file.originalname}`

    const params: IPutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: keyName,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
    }
    const putCommand = new PutObjectCommand(params)

    await this.s3Client.send(putCommand)
    const signedUrl = await this.getFileWithSignedUrl(keyName)
    return {
      key: keyName,
      url: signedUrl
    }
  }

  async DeleteFileFromS3(key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key
    })
    return await this.s3Client.send(deleteCommand)
  }
}
