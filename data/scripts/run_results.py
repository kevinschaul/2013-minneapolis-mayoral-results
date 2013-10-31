#!/usr/bin/env python

import logging
import os
import sys

import find_latest_results
import get_results
import update_results
import upload_results
import purge_results

def main():
    exitStatus = 0

    try:
        get_results.get_results()
    except Exception as e:
        logging.error(e)
        exitStatus = 1

    try:
        find_latest_results.find_latest_results()
    except Exception as e:
        logging.error(e)
        exitStatus = 1

    try:
        update_results.update_results()
    except Exception as e:
        logging.error(e)
        exitStatus = 1

    try:
        upload_results.upload_results()
    except Exception as e:
        logging.error(e)
        exitStatus = 1

    try:
        purge_results.purge_results()
    except Exception as e:
        logging.error(e)
        exitStatus = 5

    sys.exit(exitStatus)


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
    main()

