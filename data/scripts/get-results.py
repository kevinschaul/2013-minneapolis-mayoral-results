#!/usr/bin/env python

from ftplib import FTP

USERNAME = 'media'
PASSWORD = 'results'
FILENAME = 'localPrct.txt'

ftp = FTP('ftp.sos.state.mn.us')
ftp.login(USERNAME, PASSWORD)

f = open(FILENAME, 'w')

ftp.retrlines('RETR 20131105_MG/localPrct.txt', f.write)

ftp.quit()

f.close()

