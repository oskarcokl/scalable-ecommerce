import { S3Client } from '@aws-sdk/client-s3';
import { assert } from '@scalable-ecommerce/common';
import dotenv from 'dotenv';

dotenv.config({
    path: '../.env.development',
});

assert(process.env.AWS_ACCESS_KEY_ID, 'No AWS access key id provided');
assert(process.env.AWS_SECRET_ACCESS_KEY, 'No AWS secret access key provided');

const s3client = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export default s3client;
