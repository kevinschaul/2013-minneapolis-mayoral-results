#!/usr/bin/env python

import logging
import os
import time

from boto.s3.connection import S3Connection
from boto.s3.key import Key

import settings

def upload_results():
    conn = S3Connection(settings.AWS_ACCESS_KEY, settings.AWS_SECRET_KEY)
    bucket = conn.create_bucket('startribune')

    filename = 'results.json'
    k = Key(bucket)
    k.key = '2013/test/' + filename
    k.set_contents_from_filename(
        os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'processed',
            filename
        )
    )
    k.set_acl('public-read')
    logging.info(filename + ' uploaded to S3')

    filename = str(int(time.time())) + '-localPrct.txt'
    k = Key(bucket)
    k.key = '2013/test/raw/' + filename
    k.set_contents_from_filename(
        os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'raw',
            'latest-localPrct.txt'
        )
    )
    logging.info(filename + ' uploaded to S3')


if __name__ == '__main__':
    logfile = os.path.join(
        os.environ['RESULTS_LOCATION'],
        'results.log'
    )
    logging.basicConfig(
        format='[%(filename)s:%(lineno)d %(asctime)s] %(levelname)s: %(message)s',
        level=logging.INFO,
        filename=logfile
    )
    upload_results()

