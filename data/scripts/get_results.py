#!/usr/bin/env python

import ftplib
import logging
import os
import sys
import time

import settings

ATTEMPTS = 5

attempted = 0

def get_results():
    global attempted
    if attempted < ATTEMPTS:
        try:
            attempted += 1

            ftp = ftplib.FTP('ftp.sos.state.mn.us')
            ftp.login(settings.SOS_USERNAME, settings.SOS_PASSWORD)

            filename = os.path.join(
                os.environ['RESULTS_LOCATION'],
                'results',
                'raw',
                str(int(time.time())) + '-' + 'localPrct.txt'
            )
            with open(filename, 'w') as f:
                ftp.retrlines('RETR 20131105_MG/localPrct.txt', f.write)
                ftp.quit()

            logging.info('File written successfully')

        except ftplib.all_errors, error:
            logging.warning('Attempt %d of %d', attempted, ATTEMPTS)
            time.sleep(2)
            getResults()
    else:
        logging.error('Maximum attempts reached.')

if __name__ == '__main__':
    logfile = os.path.join(
        os.environ['RESULTS_LOCATION'],
        'results.log'
    )
    logging.basicConfig(
        format='[%(filename)s %(asctime)s] %(levelname)s: %(message)s',
        level=logging.INFO,
        filename=logfile
    )
    get_results()

