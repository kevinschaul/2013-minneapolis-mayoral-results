#!/usr/bin/env python

import csv
import simplejson as json
import random

results = {}

candidates = [{
    'first_name': 'Captain Jack',
    'last_name': 'Sparrow',
    'id': 0,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Mark',
    'last_name': 'Andrew',
    'id': 1,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Jackie',
    'last_name': 'Cherryhomes',
    'id': 2,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Bob',
    'last_name': 'Fine',
    'id': 3,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Don',
    'last_name': 'Samuels',
    'id': 4,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Cam',
    'last_name': 'Winton',
    'id': 5,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Dan',
    'last_name': 'Cohen',
    'id': 6,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}, {
    'first_name': 'Mark V.',
    'last_name': 'Anderson',
    'id': 7,
    'total_first_choice': 0,
    'total_second_choice': 0,
    'total_third_choice': 0
}]

results['total'] = {
    'candidates': [],
    'total_votes_first': 0,
    'total_votes_second': 0,
    'total_votes_third': 0
}

results['precincts'] = {}

data = open('data/workspace/precincts-minneapolis.csv', 'r')
reader = csv.DictReader(data)

for row in reader:
    p = {
        'id': row['vtd'],
        'total_votes_first': 0,
        'total_votes_second': 0,
        'total_votes_third': 0,
        'candidates': []
    }

    for c in candidates:
        first_choice = random.randint(0, 40)
        second_choice = random.randint(0, 40)
        third_choice = random.randint(0, 40)

        p['total_votes_first'] += first_choice
        p['total_votes_second'] += second_choice
        p['total_votes_third'] += third_choice
        c['total_first_choice'] += first_choice
        c['total_second_choice'] += second_choice
        c['total_third_choice'] += third_choice

        p['candidates'].append({
            'first_name': c['first_name'],
            'last_name': c['last_name'],
            'id': c['id'],
            'first_choice': first_choice,
            'second_choice': second_choice,
            'third_choice': third_choice
        })

    p['candidates'] = sorted(p['candidates'], key=lambda x: -x['first_choice'])

    results['precincts'][row['vtd']] = p

for c in candidates:
    results['total']['total_votes_first'] += c['total_first_choice']
    results['total']['total_votes_second'] += c['total_second_choice']
    results['total']['total_votes_third'] += c['total_third_choice']

    results['total']['candidates'].append({
        'first_name': c['first_name'],
        'last_name': c['last_name'],
        'id': c['id'],
        'first_choice': c['total_first_choice'],
        'second_choice': c['total_second_choice'],
        'third_choice': c['total_third_choice']
    })

    results['total']['candidates'] = sorted(results['total']['candidates'], 
            key=lambda x: -x['first_choice'])

print json.dumps(results)

