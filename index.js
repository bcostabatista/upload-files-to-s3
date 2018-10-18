'use strict'

const parse = require('co-busboy')
const AWS = require('aws-sdk')
const fs = require('fs')
const moment = require('moment')

const FILE_PERMISSIONS = [
    'private',
    'public-read',
    'public-read-write',
    'aws-exec-read',
    'authenticated-read',
    'bucket-owner-read',
    'bucket-owner-full-control',
    'log-delivery-write'
] 
const REGIONS = [
    'us-west-2',
    'us-west-1',
    'us-east-2',
    'us-east-1',
    'ap-south-1',
    'ap-northeast-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ca-central-1',
    'cn-north-1',
    'eu-central-1',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'sa-east-1',
    'us-gov-west-1'
]

exports.s3Upload = function * (
    accessKey = null, 
    secretKey = null,
    bucketName = null,
    region = null, 
    file = null,
    permission = null,
    acceptedExtensions = []
){
    try {
        if(!accessKey) throw new Error('AWS access key is required')
        if(!secretKey) throw new Error('AWS secret key is required')
        if(!bucketName) throw new Error('AWS bucket name is required')
        if(!region) throw new Error('Bucket region is required')
        if(!REGIONS.includes(region)) throw new Error('Invalid region')
        if(!file) throw new Error('File is required')
        if(!acceptedExtensions.length) throw new Error('Accepted extensions is required')
        if(!permission) throw new Error('Permission is required')
        if(!FILE_PERMISSIONS.includes(permission)) throw new Error('Invalid ACL permission')
        let s3 = new AWS.S3()
        s3.config.update({
            accessKeyId: accessKey,
            secretAccessKey: secretKey
        })
        let bucket = bucketName
        let parts = parse(file)
        let part
        let filename = ''
        let newFilename = ''
        let uploadedToMachine = false
        let uploadStatus = false
        let mime = ''
        while (part = yield parts) {
            mime = part.mime
            let extension = part.mime.split('/')[1]
            if (acceptedExtensions.includes(extension)) {
                filename = part.filename
                var stream = fs.createWriteStream(`/tmp/${filename}`)
                part.pipe(stream)
                var prepareFilename = new Buffer(filename + moment().format('YYYY-MM-DD HH:mm:ss'))
                newFilename = `${prepareFilename.toString('base64')}.${extension}`
                uploadedToMachine = true
            } else {
                throw new Error('Formato não suportado')
            }
        }
        uploadStatus = yield new Promise(resolve => {
            if(uploadedToMachine) {
                fs.readFile(`/tmp/${filename}`, function (err, file) {
                    let s3Key = newFilename
                    let params = { Bucket: bucket, Key: s3Key, Body: file, ContentType: mime, ACL: permission }
                    s3.putObject(params, function (err, data) {
                        if (err) {
                            resolve(err)
                        } else {
                            resolve(true)
                            let path = '/tmp/' + filename
                            if (fs.existsSync(path)) {
                                fs.unlinkSync(path)
                            }
                        }
                    })
                })
            } else {
                resolve('Upload failed')
            }
        })
        if(!uploadStatus.message) {
            return { file: `https://s3-${region}.amazonaws.com/${bucket}/${newFilename}`, uploadStatus }
        } else {
            return { uploadStatus }
        }
    } catch(error) {
        return error.message
    }
}