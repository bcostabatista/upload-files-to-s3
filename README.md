# Upload files to amazon S3
A simple module to help developers upload files to S3 buckets

### Installation

```
$ npm i upload-files-to-aws --save
```

### Example

 ```
 import { s3Upload } from 'upload-files-to-aws'
 
 ....

 router.post('/file-upload', function * (next) {
        try {
            let file = this
            this.body = yield s3Upload(
                AWS_ACCESS_KEY, 
                AWS_SECRET_ACESS_KEY,
                BUCKET_NAME,
                REGION, 
                file,
                PERMISSION,
                ACCEPTED_FILE_FORMATS_ARRAY
            )
        } catch(error) {
            this.body = {error: error.message}
        }
    })
```

##### AWS regions list

* us-west-2
* us-west-1
* us-east-2
* us-east-1
* ap-south-1
* ap-northeast-2
* ap-southeast-1
* ap-southeast-2
* ap-northeast-1
* ca-central-1
* cn-north-1
* eu-central-1
* eu-west-1
* eu-west-2
* eu-west-3
* sa-east-1
* us-gov-west-1

##### AWS ACL list

* private
* public-read
* public-read-write
* aws-exec-read
* authenticated-read
* bucket-owner-read
* bucket-owner-full-control
* log-delivery-write