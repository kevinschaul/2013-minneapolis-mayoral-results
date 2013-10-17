RESULTS_LOCATION = $(shell pwd)

GENERATED_FILES = \
	public/precincts-hennepin.json \
	public/test-results.json

all: $(GENERATED_FILES)

clean:
	rm -rf build
	rm -rf $(GENERATED_FILES)

results-run:
	export RESULTS_LOCATION=$(RESULTS_LOCATION)
	echo 'RESULTS_LOCATION=$(RESULTS_LOCATION)' > cron.txt
	echo '* * * * * $(RESULTS_LOCATION)/data/scripts/run_results.py' >> cron.txt
	crontab cron.txt

results-status:
	crontab -l

results-stop:
	crontab -r

results-log:
	touch results.log
	tail -f results.log

build/vtd2012general.zip:
	mkdir -p build
	curl -o $@ ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/vtd2012general.zip

build/vtd2012general.shp: build/vtd2012general.zip
	mkdir -p build
	unzip $< -d build
	touch $@

build/precincts-minneapolis.shp: build/vtd2012general.shp
	rm -f $@
	ogr2ogr -t_srs 'EPSG:4326' -where 'PCTNAME like "MINNEAPOLIS%"' $@ $<

build/hennepin.json: build/vtd2012general.shp
	rm -f $@
	ogr2ogr -t_srs 'EPSG:4326' -where 'PCTNAME like "MINNEAPOLIS%"' -f GeoJSON $@ $<

build/hennepin-geo.json: build/hennepin.json
	rm -f $@
	ogr2ogr -select VTD,PCTCODE -simplify 0.0001 -lco WRITE_BBOX=YES -f GeoJSON $@ $<

public/precincts-hennepin.json: build/hennepin-geo.json
	cp $< $@

public/test-results.json: build/test-results.json
	cp $< $@

build/test-results.json: data/scripts/generate-test-results.py
	python $< > $@

