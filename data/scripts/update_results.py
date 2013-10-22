#!/usr/bin/env python

import csv
import json
import logging
import os

from candidate_map import candidate_map

C_STATE = 0
C_COUNTY = 1
C_PRECINCT = 2
C_OFFICE_ID = 3
C_OFFICE = 4
C_FIPS = 5
C_CANDIDATE_ID = 6
C_CANDIDATE = 7
C_SUFFIX = 8
C_INCUMBENT = 9
C_PARTY_ID = 10
C_PRECINCTS_REPORTING = 11
C_PRECINCTS_TOTAL = 12
C_VOTES = 13
C_VOTES_PERCENTAGE = 14
C_VOTES_TOTAL = 15

def update_results():
    results = {
        'total': {
            'candidates': {},
            'total_votes_first': 0,
            'total_votes_second': 0,
            'total_votes_third': 0,
            'precincts_reporting': 0,
            'precincts_total': 0,
        },
        'precincts': {}
    }

    for i in candidate_map:
        c = candidate_map[i]
        c['first_choice'] = 0
        c['second_choice'] = 0
        c['third_choice'] = 0

    raw_results_filename = os.path.join(
        os.environ['RESULTS_LOCATION'],
        'results',
        'raw',
        'latest-localPrct.txt'
    )
    try:
        with open(raw_results_filename, 'r') as f:
            c = csv.reader(f, delimiter=';')
            for row in c:
                if row[C_OFFICE] == 'Mayor First Choice (Minneapolis)' \
                        or row[C_OFFICE] == 'Mayor Second Choice (Minneapolis)' \
                        or row[C_OFFICE] == 'Mayor Third Choice (Minneapolis)':

                    try:
                        precinct = results['precincts'][row[C_PRECINCT]]
                    except KeyError:
                        results['precincts'][row[C_PRECINCT]] = {
                            'candidates': {}
                        }
                        precinct = results['precincts'][row[C_PRECINCT]]

                    candidates = precinct['candidates']
                    candidate_id = row[C_CANDIDATE_ID]
                    try:
                        candidate = candidates[candidate_id]
                    except KeyError:
                        candidates[candidate_id] = candidate_map[candidate_id].copy()
                        candidate = candidates[candidate_id]

                    total = results['total']
                    try:
                        totalCandidate = total['candidates'][candidate_id]
                    except KeyError:
                        total['candidates'][candidate_id] = candidate_map[candidate_id].copy()
                        totalCandidate = total['candidates'][candidate_id]

                    votes = int(row[C_VOTES])
                    votes_total = int(row[C_VOTES_TOTAL])
                    if row[C_OFFICE] == 'Mayor First Choice (Minneapolis)':
                        candidate['first_choice'] = votes
                        totalCandidate['first_choice'] += votes
                        precinct['total_votes_first'] = votes_total
                        total['total_votes_first'] += votes
                    elif row[C_OFFICE] == 'Mayor Second Choice (Minneapolis)':
                        candidate['second_choice'] = votes
                        totalCandidate['second_choice'] += votes
                        precinct['total_votes_second'] =  votes_total
                        total['total_votes_second'] += votes
                    elif row[C_OFFICE] == 'Mayor Third Choice (Minneapolis)':
                        candidate['third_choice'] = votes
                        totalCandidate['third_choice'] += votes
                        precinct['total_votes_third'] =  votes_total
                        total['total_votes_third'] += votes

                    total['precincts_reporting'] = row[C_PRECINCTS_REPORTING]
                    total['precincts_total'] = row[C_PRECINCTS_TOTAL]

        results_json_filename = os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'processed',
            'results.json'
        )
        with open(results_json_filename, 'w') as f:
            f.write(json.dumps(results, indent=4))
            logging.info('JSON file processed successfully')

        # Write file to be joined with shapefile for print
        results_csv_filename = os.path.join(
            os.environ['RESULTS_LOCATION'],
            'results',
            'processed',
            'results.csv'
        )
        with open(results_csv_filename, 'w') as f:
            w = csv.writer(f)

            w.writerow([
                'vtd',
                'winner_first_name',
                'winner_last_name',
                'winner_votes',
                'total_votes',
                'winner_percent'
            ])

            for precinct_id in results['precincts']:
                precinct = results['precincts'][precinct_id]

                row = []

                winner_id = -1
                winner_votes = 0
                for candidate_id in precinct['candidates']:
                    candidate = precinct['candidates'][candidate_id]
                    first_choice = int(candidate['first_choice'])
                    if first_choice >= winner_votes:
                        winner_id = candidate_id
                        winner_votes = first_choice

                winner = precinct['candidates'][winner_id]
                if (precinct['total_votes_first'] > 0):
                    winner_percent = float(winner['first_choice']) / precinct['total_votes_first']
                else:
                    winner_precent = 0.0

                row.append('27053' + precinct_id)
                row.append(winner['first_name'])
                row.append(winner['last_name'])
                row.append(winner_votes)
                row.append(precinct['total_votes_first'])
                row.append(winner_percent)

                w.writerow(row)
            logging.info('CSV file processed successfully')

        # Write accompanying .csvt file for easy import into QGIS
        with open(results_csv_filename + 't', 'w') as f:
            f.write('"String","String","String","Integer","Integer","Real"');

    except IOError as e:
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
    update_results()

