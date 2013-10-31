#!/usr/bin/env python

import logging
import os
import re
import shutil

def find_latest_results():
    results_path = os.path.join(
        os.environ['RESULTS_LOCATION'],
        'results',
        'raw'
    )
    all_results_files = os.listdir(results_path)
    timestamps = []
    regex = re.compile('([0-9]+)-localPrct.txt')

    for results_file in all_results_files:
        r = regex.search(results_file)
        if (r):
            timestamps.append(int(r.groups()[0]))

    timestamps_sorted = sorted(timestamps, reverse=True)

    latest_path = str(timestamps_sorted[0]) + '-localPrct.txt'
    latest_path_full = os.path.join(
        os.environ['RESULTS_LOCATION'],
        'results',
        'raw',
        latest_path
    )

    shutil.copy(
        latest_path_full,
        os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'raw',
            'latest-localPrct.txt'
        )
    )
    logging.info('Latest file successfully found')

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
    find_latest_results()

