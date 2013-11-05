# 2013-9-26-election-results

## Secretary of State results information

### General information
- Results will be reported beginning at 8:00 p.m. on election night
- For ranked-choice races, only the results of the first round of voting will be displayed.

### Links

[SOS status information](https://owa.startribune.com/owa/redir.aspx?C=WTo23Ingr06Wigub1TMP_3BpBZebltAIem6HUnuC4aW9Sm86sBP2gJsTvGvqHN241LJKnxMpqSk.&URL=http%3a%2f%2fsoshelpdesk.sos.state.mn.us%2fsysstatus%2fmediainfopage.htm)

[ftp.sos.state.mn.us](ftp://ftp.sos.state.mn.us)

- directory for 2013 results: `20131105_MG`

### Testing
- Testing begins on October 7
- In full load tests, random data will be generated so that all precincts end up being 100% reported.
- The final files will be available on the ftp website as `fullloadtest1.zip`

#### Full load test schedule:
1. 10:30 - 11:30 a.m., Friday, October 18
2. 10:30 - 11:30 a.m., Friday, October 25
3. 10:30 - 11:30 a.m., Friday, November 1

### Files we care about on election night:
- `local.txt`: Municipal offices and questions race results summary
- `localPrct.txt`: All municipal and school district offices and questions by precinct

### Files we care about before election night:
- `PartyTbl.txt`: Party, principle, or non-partisan designations
- `PrctTbl.txt`: Precincts in the election: county and precinct numbers and districts
- `LocalCandTbl.txt`: Candidates in the election
- `LocalCandDetails.txt`: Candidates in the election with contact information
- [Layout of the text files](http://minnesotaelectionresults.sos.state.mn.us/Select/DownloadFileFormats/7)

## Back-end architecture

1. [`get_results.py`](data/scripts/get_results.py) Get results from ftp
2. [`find_latest_results.py`](data/scripts/find_latest_results.py) Find latest results file for `update_results.py`
3. [`update_results.py`](data/scripts/update_results.py) Format results into json
4. [`purge_results.py`](data/scripts/purge_results.py) Delete raw results files (keeping the five most recent files)

### Finite state machine
We want to save every successful response from the SOS server, and
process the files independently of retrieval. To accomplish this, we'll
store the files in a finite state machine so each process can determine
what it needs to do.

The possible state of each file is as follows:

1. raw - files are raw when first retrieved from the server
2. processed - files become processed once they are successfully
   converted into json
3. invalid - files become invalid if there is a problem converting them
   into json # Not implemented

## HALP!

### Installation

    npm install
    make install

### Running a local server
#### To view your project locally:

    grunt local

    # Or simply:
    grunt

Open [http://0.0.0.0:8000/](http://0.0.0.0:8000/) in your browser.

#### To view with Star Tribune header/footers enabled:

    grunt strib

Open [http://0.0.0.0:8000/](http://0.0.0.0:8000/) in your browser.

### Running the results scripts (on election night)

We are running a micro ec2 instance that will run the results backend
code on election night (and in the following days). To ssh into the
machine, locate your `election-results.pem` file and run the following
command:

    ssh -i ~/.ssh/election-results.pem ubuntu@ec2-54-201-0-169.us-west-2.compute.amazonaws.com

Note: The public ip address may change. If it doesn't work, double check
this on the [Amazon AWS console](https://console.aws.amazon.com/ec2/v2/home)

To start:

    make results-start
    # The results scripts will begin running every five minutes

To stop:

    make results-stop

To get the status:

    make results-status

To watch the log file:

    make results-log
    # To stop watching the log file: ctrl+C

Errors are mailed to kevin.schaul@gmail.com. If you'd also like a copy,
add yourself in the MAILTO variable in [`Makefile`](Makefile).

### Stress testing

This project uses [multi-mechanize](http://testutils.org/multi-mechanize/) for stress testing. [stress-test/test_scripts/boundaries_random.py](stress-test/test_scripts/boundaries_random.py) generates random point queries on the voting precincts file.

[Issue #37](https://github.com/kevinschaul/results/issues/37) has the
latest results.

To run the tests:

    # Requires Python modules `multimech` and `requests` to be installed
    multimech-run stress-test

### URLs

#### Production
[http://apps.startribune.com/news/20131105-minneapolis-mayor-election-results/](http://apps.startribune.com/news/20131105-minneapolis-mayor-election-results/)

