#!/usr/bin/env python

import ftplib
import sys
import time

ATTEMPTS = 5

USERNAME = 'media'
PASSWORD = 'results'
FILENAME = 'localPrct.txt'

attempted = 0

def getResults():
    global attempted
    if attempted < ATTEMPTS:
        try:
            attempted += 1

            ftp = ftplib.FTP('ftp.sos.state.mn.us')
            ftp.login(USERNAME, PASSWORD)

            with open(FILENAME, 'w') as f:
                ftp.retrlines('RETR 20131105_MG/localPrct.txt', f.write)
                ftp.quit()

            print 'File written successfully'

        except ftplib.all_errors, error:
            sys.stderr.write('ERROR: %s\n' % error)
            sys.stderr.write('Attempt %d of %d\n' % (attempted, ATTEMPTS))
            time.sleep(2)
            getResults()
    else:
        print 'Maximum attempts reached.'

if __name__ == '__main__':
    getResults()

