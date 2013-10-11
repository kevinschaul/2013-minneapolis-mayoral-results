#!/usr/bin/env python

import csv
import simplejson as json

from candidate_map import candidate_map

C_PRECINCT = 2
C_OFFICE_ID = 3
C_OFFICE = 4
C_CANDIDATE_ID = 6
C_CANDIDATE = 7
C_PARTY_ID = 10
C_PRECINCTS_REPORTING = 11
C_PRECINCTS_TOTAL = 12
C_VOTES = 13
C_VOTES_PERCENTAGE = 14
C_VOTES_TOTAL = 15

results = {
    'precincts': {}
}

with open('../workspace/localPrct.txt', 'r') as f:
    c = csv.reader(f, delimiter=';')
    for row in c:
        if row[C_OFFICE] == 'Mayor First Choice (Minneapolis)' \
                or row[C_OFFICE] == 'Mayor Second Choice (Minneapolis)' \
                or row[C_OFFICE] == 'Mayor Third Choice (Minneapolis)':

            candidate_id = row[C_CANDIDATE_ID]
            candidate_info = candidate_map[candidate_id]

            try:
                precinct = results['precincts'][row[C_PRECINCT]]
            except KeyError:
                results['precincts'][row[C_PRECINCT]] = {
                    'candidates': {}
                }
                precinct = results['precincts'][row[C_PRECINCT]]

            candidates = precinct['candidates']
            candidates[candidate_id] = candidate_info
            candidate = candidates[candidate_id]

            if row[C_OFFICE] == 'Mayor First Choice (Minneapolis)':
                candidate['first_choice'] = row[C_VOTES]
            elif row[C_OFFICE] == 'Mayor Second Choice (Minneapolis)':
                candidate['second_choice'] = row[C_VOTES]
            elif row[C_OFFICE] == 'Mayor Third Choice (Minneapolis)':
                candidate['third_choice'] = row[C_VOTES]

print json.dumps(results, indent=4 * ' ')

