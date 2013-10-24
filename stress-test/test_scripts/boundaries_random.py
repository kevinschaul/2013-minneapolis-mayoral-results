import random
import time

import requests

class Transaction(object):
    def __init__(self):
        pass

    def run(self):
        r1 = random.random() + 44.9
        r2 = random.random() - 93.1
        payload = {
            'contains': str(r1) + ',' + str(r2),
            'sets': 'voting-precincts-2012'
        }

        start_timer = time.time()
        r = requests.get('http://ec2-54-200-220-1.us-west-2.compute.amazonaws.com/1.0/boundary/',
                params=payload)
        end_timer = time.time()

        latency = end_timer - start_timer
        self.custom_timers['Boundaries_Timer'] = latency

if __name__ == '__main__':
    trans = Transaction()
    trans.run()
    print trans.custom_timers

