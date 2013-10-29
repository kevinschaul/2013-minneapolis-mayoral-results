#!/usr/bin/env python

import logging
import os
import re

def purge_results():
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

    # Loop through every file except the five most recent
    for timestamp in timestamps_sorted[5:]:
        latest_path = str(timestamp) + '-localPrct.txt'
        latest_path_full = os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'raw',
            latest_path
        )
        os.remove(latest_path_full)
        logging.info(latest_path + ' removed from local disk')

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
    purge_results()

