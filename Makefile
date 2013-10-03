GENERATED_FILES = \
	public/precincts-hennepin.json

all: $(GENERATED_FILES)

clean:
	rm -rf build
	rm -rf $(GENERATED_FILES)

build/vtd2012general.zip:
	mkdir -p build
	curl -o $@ ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/vtd2012general.zip

build/vtd2012general.shp: build/vtd2012general.zip
	mkdir -p build
	unzip $< -d build
	touch $@

build/hennepin.json: build/vtd2012general.shp
	rm -f $@
	ogr2ogr -t_srs 'EPSG:4326' -where 'PCTNAME like "MINNEAPOLIS%"' -f GeoJSON $@ $<

build/hennepin-topo.json: build/hennepin.json
	topojson -o $@ -q 1e4 -p pctcode=PCTCODE,id=VTD $<

build/hennepin-geo.json: build/hennepin.json
	rm -f $@
	ogr2ogr -select VTD -simplify 0.0001 -lco WRITE_BBOX=YES -f GeoJSON $@ $<

public/precincts-hennepin.json: build/hennepin-geo.json
	cp $< $@

