#!/usr/bin/env python

import logging
import os

import find_latest_results
import get_results
import update_results

def main():
    try:
        get_results.get_results()
    except Exception as e:
        logging.error(e)

    try:
        find_latest_results.find_latest_results()
    except Exception as e:
        logging.error(e)

    try:
        update_results.update_results()
    except Exception as e:
        logging.error(e)

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
    main()

