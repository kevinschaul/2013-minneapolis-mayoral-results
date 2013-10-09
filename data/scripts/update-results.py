#!/usr/bin/env python

import csv
import simplejson as json

from candidate_map import candidates

print candidates

C_POSITION = 4
C_CANDIDATE = 7

results = {}

with open('../workspace/localPrct.txt', 'r') as f:
    c = csv.reader(f, delimiter=';')
    for row in c:
        if row[C_POSITION] == 'Mayor First Choice (Minneapolis)' \
                or row[C_POSITION] == 'Mayor Second Choice (Minneapolis)' \
                or row[C_POSITION] == 'Mayor Third Choice (Minneapolis)':
            pass


print json.dumps(results)

