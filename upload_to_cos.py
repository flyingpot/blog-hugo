from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

secret_id  = os.environ['SECRET_ID']
secret_key = os.environ['SECRET_KEY']
region = os.environ['REGION']
bucket = os.environ['BUCKET']
token = None
scheme = 'https'

config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token, Scheme=scheme)

client = CosS3Client(config)

response = client.list_objects(
    Bucket=bucket
)

for metadata in response['Contents']:
    response = client.delete_object(
        Bucket=bucket,
        Key=metadata['Key']
    )

for root, _, files in os.walk("."):
    for file in files:
        object = os.path.join(root, file)

        response = client.put_object(
            Bucket=bucket,
            Body=object,
            Key=object
        )
