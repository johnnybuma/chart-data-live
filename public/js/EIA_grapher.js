/**
 * EIA_grapher.js
 * version 0.6
 * Created by Mark Elbert on 3/12/15
 * U.S. Energy Information Administration
 *
 * Copyright-free redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 *
 * THIS SOFTWARE IS PROVIDED BY THE U.S. Energy Information Administration AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Intended use is to help users create interactive data visualizations
 * using real-time data from EIA's public data API
 *
 * Learn more at www.eia.gov/api/widgets.cfm
 *
 * Using the EIA API / this code requires a free API key form
 *
 * TODO:  bar and pie comparisons
 * TODO: play and pause map with xAxis plot line
 * TODO: show current date of map and bar and pie
 *
 */
'use strict';
var EIA_grapher = function(){ //single top level variable see
    var literals = {
        eiaVisualizationClass: 'eia-visualization',
        chartClass: 'eia_map_widget',
        mapClass: 'eia_map_widget',
        mapRelationWidthSplit: 0.69,
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        secondaryVizModes: { //enumeration of secondary visualization modes pass in via a DIV's "relation-mode" attribute.  The default mode is "pie"  
            "pie": 'pie', //requires a relation and API fetch.  Relation must be summable, else displays as bar
            "pie-comparison": 'pie-comparison',  //requires a relation and API fetch; shows a donut of first and last period returned.  Relation must be summable, else displays as "bar-comparison" mode
            "bar": 'bar',  //requires a relation and API fetch
            "bar-comparison": 'bar-comparison',  //requires a relation and API fetch; shows a donut of first and last period returned
            "line": 'line',  //relation optional: if no relation, show a line plot of the region data on mouseover. if relation show line plot of 
            "area": 'area'  //relation optional.  if relation, must be summable else degrades to "line" mode
        },   
        derivedMapDefinitions: {
            eia_elect_regions: {
                derivedFrom: "us_merc_en",
                regions: [
                    {
                        "name": "New England",
                        "code": "USA-CT+USA-MA+USA-ME+USA-NH+USA-RI+USA-VT",
                        "components": ["USA-CT","USA-ME","USA-MA","USA-NH","USA-RI","USA-VT"]
                    },
                    {
                        "name": "Middle Atlantic",
                        "code": "USA-NJ+USA-NY+USA-PA",
                        "components": ["USA-NJ","USA-NY","USA-PA"]
                    },
                    {
                        "name": "East North Central",
                        "code": "USA-IL+USA-IN+USA-MI+USA-OH+USA-WI",
                        "components": ["USA-IL","USA-IN","USA-MI","USA-OH","USA-WI"]
                    },
                    {
                        "name": "West North Central",
                        "code": "USA-IA+USA-KS+USA-MN+USA-MO+USA-ND+USA-NE+USA-SD",
                        "components": ["USA-IA","USA-KS","USA-MN","USA-MO","USA-NE","USA-ND","USA-SD"]
                    },
                    {
                        "name": "South Atlantic",
                        "code": "USA-DC+USA-DE+USA-FL+USA-GA+USA-MD+USA-NC+USA-SC+USA-VA+USA-WV",
                        "components": ["USA-DE","USA-DC","USA-FL","USA-GA","USA-MD","USA-NC","USA-SC","USA-VA","USA-WV"]
                    },
                    {
                        "name": "East South Central",
                        "code": "USA-AL+USA-KY+USA-MS+USA-TN",
                        "components": ["USA-AL","USA-KY","USA-MS","USA-TN"]
                    },
                    {
                        "name": "West South Central",
                        "code": "USA-AR+USA-LA+USA-OK+USA-TX",
                        "components": ["USA-AR","USA-LA","USA-OK","USA-TX"]
                    },
                    {
                        "name": "Mountain",
                        "code": "USA-AZ+USA-CO+USA-ID+USA-MT+USA-NM+USA-NV+USA-UT+USA-WY",
                        "components": ["USA-AZ","USA-CO","USA-ID","USA-MT","USA-NV","USA-NM","USA-UT","USA-WY"]
                    },
                    {
                        "name": "Pacific Contiguous",
                        "code": "USA-CA+USA-OR+USA-WA",
                        "components": ["USA-CA","USA-OR","USA-WA"]
                    },
                    {
                        "name": "Pacific Noncontiguous",
                        "code": "USA-AK+USA-HI",
                        "components": ["USA-AK","USA-HI"]
                    }
                ]
            },
            padds: {
                derivedFrom: "us_merc_en",
                regions: [
                    {
                        "name": "PADD I (East Coast)",
                        "code": "USA-CT+USA-DC+USA-DE+USA-FL+USA-GA+USA-MA+USA-MD+USA-ME+USA-NC+USA-NH+USA-NJ+USA-NY+USA-PA+USA-RI+USA-SC+USA-VA+USA-VT+USA-WV",
                        "components": ["USA-CT","USA-ME","USA-MA","USA-NH","USA-RI","USA-VT","USA-DE","USA-DC","USA-MD","USA-NJ","USA-NY","USA-PA","USA-FL","USA-GA","USA-NC","USA-SC","USA-VA","USA-WV"]
                    },
                    {
                        "name": "PADD II (Midwest)",
                        "code": "USA-IA+USA-IL+USA-IN+USA-KS+USA-KY+USA-MI+USA-MN+USA-MO+USA-ND+USA-NE+USA-OH+USA-OK+USA-SD+USA-TN+USA-WI",
                        "components": ["USA-IL","USA-IN","USA-IA","USA-KS","USA-KY","USA-MI","USA-MN","USA-MO","USA-NE","USA-ND","USA-SD","USA-OH","USA-OK","USA-TN","USA-WI"]
                    },
                    {
                        "name": "PADD III (Gulf Coast)",
                        "code": "USA-AL+USA-AR+USA-LA+USA-MS+USA-NM+USA-TX",
                        "components": ["USA-AL","USA-AR","USA-LA","USA-MS","USA-NM","USA-TX"]
                    },
                    {
                        "name": "PADD IV (Rocky Mountain)",
                        "code": "USA-CO+USA-ID+USA-MT+USA-UT+USA-WY",
                        "components": ["USA-CO","USA-ID","USA-MT","USA-UT","USA-WY"]
                    },
                    {
                        "name": "PADD V (West Coast)",
                        "code": "USA-AK+USA-AZ+USA-CA+USA-HI+USA-NV+USA-OR+USA-WA",
                        "components": ["USA-AK","USA-AZ","USA-CA","USA-HI","USA-NV","USA-OR","USA-WA"]
                    }
                ]
            },
            padds_sub:  {
                derivedFrom: "us_merc_en",
                regions: [
                    {
                        "name": "PADD I, Subdistrict A (New England): Connecticut, Maine, Massachusetts, New Hampshire, Rhode Island, and Vermont.",
                        "code": "USA-CT+USA-MA+USA-ME+USA-NH+USA-RI+USA-VT",
                        "components": ["USA-CT","USA-ME","USA-MA","USA-NH","USA-RI","USA-VT"]
                    },
                    {
                        "name": "PADD I, Subdistrict B (Central Atlantic): Delaware, District of Columbia, Maryland, New Jersey, New York, and Pennsylvania.",
                        "code": "USA-DC+USA-DE+USA-MD+USA-NJ+USA-NY+USA-PA",
                        "components": ["USA-DE","USA-DC","USA-MD","USA-NJ","USA-NY","USA-PA"]
                    },
                    {
                        "name": "PADD I, Subdistrict C (Lower Atlantic): Florida, Georgia, North Carolina, South Carolina, Virginia, and West Virginia.",
                        "code": "USA-FL+USA-GA+USA-NC+USA-SC+USA-VA+USA-WV",
                        "components": ["USA-FL","USA-GA","USA-NC","USA-SC","USA-VA","USA-WV"]
                    },
                    {
                        "name": "PADD II (Midwest): Illinois, Indiana, Iowa, Kansas, Kentucky, Michigan, Minnesota, Missouri, Nebraska, North Dakota, South Dakota, Ohio, Oklahoma, Tennessee, and Wisconsin.",
                        "code": "USA-IA+USA-IL+USA-IN+USA-KS+USA-KY+USA-MI+USA-MN+USA-MO+USA-ND+USA-NE+USA-OH+USA-OK+USA-SD+USA-TN+USA-WI",
                        "components": ["USA-IL","USA-IN","USA-IA","USA-KS","USA-KY","USA-MI","USA-MN","USA-MO","USA-NE","USA-ND","USA-SD","USA-OH","USA-OK","USA-TN","USA-WI"]
                    },
                    {
                        "name": "PADD III (Gulf Coast): Alabama, Arkansas, Louisiana, Mississippi, New Mexico, and Texas",
                        "code": "USA-AL+USA-AR+USA-LA+USA-MS+USA-NM+USA-TX",
                        "components": ["USA-AL","USA-AR","USA-LA","USA-MS","USA-NM","USA-TX"]
                    },
                    {
                        "name": "PADD IV (Rocky Mountain): Colorado, Idaho, Montana, Utah, and Wyoming.",
                        "code": "USA-CO+USA-ID+USA-MT+USA-UT+USA-WY",
                        "components": ["USA-CO","USA-ID","USA-MT","USA-UT","USA-WY"]
                    },
                    {
                        "name": "PADD V (West Coast): Alaska, Arizona, California, Hawaii, Nevada, Oregon, and Washington.",
                        "code": "USA-AK+USA-AZ+USA-CA+USA-HI+USA-NV+USA-OR+USA-WA",
                        "components": ["USA-AK","USA-AZ","USA-CA","USA-HI","USA-NV","USA-OR","USA-WA"]
                    }
                ]
            }
        }
    };
    var nonWordPat = /\W/; // compiled once instead of local var in _categoriesFromSeries
    var drawAllVisualizations = function(){
        $('div.'+literals.eiaVisualizationClass).each(function(i, $vizDiv){drawDivVisualization($vizDiv)});
    };
    function drawDivVisualization(vizDiv){
        //creates an interactive visualization in the <DIV> $vizDiv, based on the tag's HTML attributes
        var $vizDiv = $(vizDiv),
            map = $vizDiv.attr("map"),
            title = $vizDiv.attr("title"),
            geoset_id = $vizDiv.attr("geoset_id"),
            cube_id = $vizDiv.attr("cube_id"),
            start = $vizDiv.attr("start"),
            end = $vizDiv.attr("end"),
            num = $vizDiv.attr("num"),
            series_ids = $vizDiv.attr("series_ids"),
            initial_regions = $vizDiv.attr("initial_regions"), //initial regions are removed when mouseover & click events display new data
            tracking_regions = $vizDiv.attr("tracking_regions"), //tracking regions stay on line and bar relations chart even when user events add series
            relation_id = $vizDiv.attr("relation_id"),
            relation_mode = $vizDiv.attr("relation_mode"),
            chartOptions;
        if(tracking_regions) tracking_regions = tracking_regions.split(';');  //tracking_regions is a list if provided
        if(initial_regions) initial_regions = initial_regions.split(';');  //initial_regions is a list if provided

        //depending on tag attributes (map, geoset_id, relation_id, relation_mode, & tracking_regions), create a:
        // A. map-relation chart interactive
        // B. map
        // C. series chart,
        // D. relation chart (without an accompanying map)
        if(map&&geoset_id) {
            //either (A) or (B): either way we have a map
            var $mapDiv, $relationDiv, relationChart = false, vectorMap;
            //create component <DIV> as necessary for a map-relation chart interactive
            if(relation_id || relation_mode== literals.secondaryVizModes.line || relation_mode == literals.secondaryVizModes.area){
                // A. map-relation chart interactive!!
                var totalWidth = $vizDiv.width();  //create a 60% - 40% map / chart split
                var divHeight = $vizDiv.innerHeight();  //need to apply height to inner divs

                $vizDiv.html('<div class="EIA_relation" style="float: right;width: '+parseInt(totalWidth*(1-literals.mapRelationWidthSplit-0.01))+'px;"></div><div class="EIA_map" style="display:inline-block;width: '+(100*literals.mapRelationWidthSplit)+'%;position: relative"></div>')
                $mapDiv = $vizDiv.find('.EIA_map').height(divHeight);
                $relationDiv = $vizDiv.find('.EIA_relation').height(divHeight);
            } else {
                // B. map (solo without secondary visualization)
                $mapDiv = $vizDiv;
            }

            //call makeMapOptions to make the mapOptions object.  If secondary visualization, create the chart and map events to link the map to the chart
            makeMapOptions(
                _buildInteractiveMapChart,
                map,
                geoset_id,
                tracking_regions,
                initial_regions,
                start,
                end,
                num
            );
            return true;
        } else {
            if(series_ids) {
                // C. series chart,
                chartOptions = makeHighchartOptionsForSeries(
                    title,
                    series_ids,
                    start,
                    end,
                    num,
                    relation_mode
                );

                publicMethods.visualizationReady($vizDiv, chartOptions.relation, 'graph', chartOptions);
                $vizDiv.highcharts(chartOptions);
            } else {
                // D. relation chart (without an accompanying map)
                if(relation_id){ //solo relationship chart without an accompanying interactive map
                    var regionCode = $vizDiv.attr("region");
                    makeRelationChartOptions(function(chartOptions){

                            publicMethods.visualizationReady($vizDiv, chartOptions.relation, 'primary_relation', chartOptions);
                            $vizDiv.highcharts(chartOptions);
                        },
                        $vizDiv,
                        relation_id,
                        regionCode,
                        start,
                        end,
                        num,
                        relation_mode
                    );
                }
            }
        }

        function _buildInteractiveMapChart(mapOptions){
            //this is the callback function after makeMapOptions fetches the geoset data and returns a jVectormap options object
            if(relation_id){
                mapOptions.regionsSelectable = true; //default is false
                mapOptions.regionsSelectableOne = true;
                //1. create the relation chart (secondary viz) using the Highchart charting library

                //bars, pies and donuts do not have datetime axis, but add one for line or area mode
                if(initial_regions){
                    makeRelationChartOptions(function(chartOptions){
                            chartOptions.chart.renderTo = $relationDiv.get(0);
                            publicMethods.visualizationReady($relationDiv, chartOptions.relation, 'relation', chartOptions);
                            relationChart = new Highcharts.Chart(chartOptions)
                        },
                        $relationDiv,
                        relation_id,
                        initial_regions[0],
                        start,
                        end,
                        num,
                        relation_mode,
                        mapOptions
                    );
                } else {
                    var relationChartOptions =  {
                        chart: {
                            renderTo: $relationDiv.get(0),
                            type: relation_mode
                        },
                        subtitle: {
                            text: 'click a region to view details'
                        },
                        series: [],
                        yAxis: {
                            title: {
                                text: mapOptions.geosetData.units
                            }
                        }
                    };
                    if(relation_mode=='line'||relation_mode=='area') relationChartOptions.xAxis = {type: 'datetime'};
                    publicMethods.visualizationReady($relationDiv, null, 'relation', chartOptions);
                    relationChart = new Highcharts.Chart(relationChartOptions);
                }

                //2. add the onRegion click event handler
                mapOptions.onRegionClick = function(event, regionCode){
                    if(mapOptions.geosetData && mapOptions.geosetData.series[regionCode]){
                        if(relationChart) relationChart.destroy();
                        makeRelationChartOptions(function(chartOptions){
                                chartOptions.chart.renderTo = $relationDiv.get(0);
                                publicMethods.visualizationReady($relationDiv, chartOptions.relation, 'relation', chartOptions);
                                relationChart = new Highcharts.Chart(chartOptions)
                            },
                            $relationDiv,
                            relation_id,
                            regionCode,
                            start,
                            end,
                            num,
                            relation_mode,
                            mapOptions
                        );
                    }
                }
            } else {
                if(relation_mode== literals.secondaryVizModes.line || relation_mode == literals.secondaryVizModes.area){
                    //auto viz form map data
                    //1. create Highchart
                    var thisMapsSelectedRegions = [];
                    var relationChartOptions =  {
                        chart: {
                            renderTo: $relationDiv.get(0),
                            type: relation_mode  //supports line or area modes (area can only be used to display a single series)
                        },
                        lang: {
                            noData: "click on regions<br> to compare history"
                        },
                        title: {
                            text: 'click map to select',
                            style: {
                                "fontSize": "12px",
                                color: '#555555'
                            }
                        },
                        series: [],
                        xAxis: {
                            type: 'datetime'
                        },
                        yAxis: {
                            title: {
                                text: mapOptions.geosetData.units
                            }
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                                var d = new Date(this.x||0),
                                    seriesLine = this.series.name + (this.x?' in ' + readableDateFromUtcDate(d, mapOptions.geosetData.f):'') + ':',
                                    value = Highcharts.numberFormat(Math.abs(this.point.y), 0) + ' ' + mapOptions.geosetData.units,
                                    chartWidth = $(this.series.chart.container).width();
                                return _breakInsert(seriesLine, chartWidth)
                                    +'<br/>'
                                    + _breakInsert(value, chartWidth);
                            }
                        }
                    };
                    publicMethods.visualizationReady($relationDiv, null, 'relation', chartOptions);
                    relationChart = new Highcharts.Chart(relationChartOptions);

                    //2. add the onRegion mouseover event handler
                    mapOptions.onRegionOver = function(event, regionCode){
                        if(mapOptions.geosetData && mapOptions.geosetData.series[regionCode]){
                            _removeUnselectedUntrackedLines();
                            relationChart.setTitle({text: 'click map to select'}); //mapOptions.geosetData.setName});  //add a title and remove the subtitle = the call to click/mouse over
                            if(!relationChart.get(regionCode)) _showRegionSeries(relationChart, mapOptions.geosetData, regionCode);
                            relationChart.yAxis[0].userMax = null;  //Highcharts bugs when lots on mouseover fire, it sometimes gets confused and sets and then rescaling no longer works correctly
                            relationChart.redraw();
                        }
                    };
                    mapOptions.onRegionOut = function(event, regionCode){
                        _removeUnselectedUntrackedLines();
                        relationChart.redraw();
                    };
                    //3. if line mode (not area mode!), enable "stick on slick" comparisons
                    if(relation_mode== literals.secondaryVizModes.line){
                        mapOptions.regionsSelectable = true; //default is false
                        mapOptions.regionsSelectableOne = false;
                        mapOptions.onRegionSelected = function(event, regionCode,  isSelected, selectedRegions){
                            thisMapsSelectedRegions = selectedRegions;
                            _removeUnselectedUntrackedLines();
                            if(isSelected && !relationChart.get(regionCode)) _showRegionSeries(relationChart, mapOptions.geosetData, regionCode);
                            relationChart.redraw();
                        };
                    }
                }
            }
            publicMethods.visualizationReady($mapDiv, mapOptions.geosetData, 'map', mapOptions.geosetData);
            $mapDiv.vectorMap(mapOptions);

            //select the initial regions for non-relationship maps
            if(!relation_id){
                var trackingAndInitialRegions = [];
                if(tracking_regions) trackingAndInitialRegions = trackingAndInitialRegions.concat(tracking_regions);
                if(initial_regions) trackingAndInitialRegions = trackingAndInitialRegions.concat(initial_regions);
                if(trackingAndInitialRegions.length){
                    var $jmap = $mapDiv.vectorMap('get', 'mapObject');
                    $jmap.setSelectedRegions(trackingAndInitialRegions);
                }
            }
            //add the map title
            $mapDiv.prepend('<span class="EIA-map-title" style="position: absolute;z-index: 10000;left: 100px;color: black;"></span>')
                .find('.EIA-map-title').html(title||mapOptions.title);

            function _removeUnselectedUntrackedLines(){
                var i, hcSerie;
                for(i=0;i<relationChart.series.length;i++){
                    hcSerie = relationChart.series[i];
                    if(thisMapsSelectedRegions.indexOf(hcSerie.options.id)===-1 && (!tracking_regions || tracking_regions.indexOf(hcSerie.options.id)===-1)) hcSerie.remove(false);  //note: don't care if series in initial_regions
                }
            }
        }
    }
    function makeHighchartOptionsForSeries(title, series_ids, start, end, num, mode){
        if(window.Highcharts){
            var i,
                arySeries_id = series_ids.split(';'),
                highchartOptions = {
                    eia_start: start,
                    eia_end: end,
                    eia_num: num,
                    series: [],
                    title: {text: ""}
                };
            if(title) highchartOptions.title = {text: title};
            for(i=0;i<arySeries_id.length;i++){
                highchartOptions.series.push({eia_series_id: arySeries_id[i]});
            }
            return highchartOptions;
        } else {
            if($(document).plot){  //FLOT

            } else {
                throw "no supported charting package (Highcharts or FlotJS) detected."
            }
        }
    }
    function makeRelationChartOptions(callback, $relationDiv, relation_id, regionCode, start, end, num, secondaryVizMode, mapOptions){
        //if no "date" passed in, use latest in data series
        //if no "secondaryVizMode" passed in, use relation.issummable to choose between pie and bar.  Note: area|pie short to line|bar if relationship is not summable;
        var apiParams = {
            command: 'relation',
            relation_id: relation_id,
            region: regionCode
        };
        var date;
        if(start) apiParams.start = start;
        if(end) apiParams.end = end;
        if(num) apiParams.num = num;
        if(secondaryVizMode == literals.secondaryVizModes.bar  || secondaryVizMode == literals.secondaryVizModes.pie){ //just a single point is needed
            if(!start) {
                apiParams.num = 1;
            } else {
                apiParams.end = start;
                date = start;
            }
        }
        var relationKey = relation_id+'|'+regionCode+'|'+ (start||1);
        if(EIA_grapher.data.relations[relationKey]){
            callback(_relChartOptions());
        }
        callAPI(apiParams, function(eiaData, textStatus, jqXHR){
            if(!eiaData.relation) throw 'unable to fetch data for relation_id='+relation_id+' and region='+regionCode;
            EIA_grapher.data.relations[relationKey] = eiaData.relation;
            callback(_relChartOptions());
        });
        function _relChartOptions(){
            //1. detect order no longer possible (it complicated!)
            //2. find geoName from assets geoKey
            var relation = EIA_grapher.data.relations[relationKey];
            var relationSeries = relation.series, i;
            _categoriesFromSeries(relationSeries); //make usable category names
            var type;
            switch(secondaryVizMode||'pie'){ //if undefined, try to do a pie (degrades automatically to bar if not summable
                case 'pie':
                case 'pie-comparison':
                    type = relation.summable?'pie':'bar';
                    break;
                case 'bar':
                case 'bar-comparison':
                    type = 'bar';
                    break;
                case 'area':
                    type = ((relation.stack_facets == null) ? (relation.summable?'area':'line') : 'bar'); //2D relations can only be a bar
                    break;
                case 'line':
                    type = 'line';
                    break;
            }

            relation.hasData = false;
            for(i=0;i<relationSeries.length;i++){
                if(relationSeries[i].data){
                    relation.hasData = true;
                    if(relationSeries[i].stack_facets != null) type = 'bar'; //override for 2D relation
                    break;
                }
            }
            var title;
            if(mapOptions){
                var titles = [{name: mapOptions.title}, {name: relation.vertexname}];
                _categoriesFromSeries(titles);
                title = titles[1].categoryName;
            } else {
                title = relation.vertexname;
            }
            var chartWidth = $relationDiv.width(),
                chartHeight = $relationDiv.height();
            //3. make base chart options object
            var relationHighChartOptions = {
                chart: {
                    type: type,
                    relation_id: relation_id,
                    date: date
                },
                relation: relation, //stash a reference to the fetched data object
                title: {
                    text: chartWidth? _breakInsert(title, chartWidth) : title,
                    style: {fontSize: '12px'},
                    align: 'center'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: false,
                            align: 'left',
                            formatter: function(){
                                return relation.hasData?(this.y===null?"no data":this.y):'';
                            }
                        },
                        borderWidth: 0,
                        animation: false,
                        stacking: 'normal'
                    },
                    pie: {
                        cursor: 'pointer',
                        showInLegend: true,
                        dataLabels: {
                            enabled: true,
                            format: '{point.percentage:.1f}%', //had value and units but size was a problem even with line breaks: {point.y}<br>'+relation.units+'<br>
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    },
                    area: {
                        stacking: 'normal'
                    }
                },
                xAxis: {
                    categories: [],
                    title: {
                        text: null
                    },
                    lineWidth: 1,
                    //minorGridLineWidth: 0,
                    //minorTickLength: 0,
                    //tickLength: 0,
                    labels: {
                        enabled: true
                    }
                },
                yAxis: {
                    title: {
                        text:  relation.units||relation.series[0].units,
                        align: 'low'
                    }
                    /*labels: {
                        enabled: false
                    },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    gridLineWidth: 0*/
                },
                //not the cause of the right margin problem: exporting: false
                legend: {
                    floating: false,
                    borderWidth: 0,
                    maxHeight: parseInt(chartHeight * 0.25),
                    labelFormatter: function () {
                        return _breakInsert(this.name||this.seriesName, $((this.chart && this.chart.container) || this.series.chart.container).width());
                    }
                },
                series: [],
                tooltip: {
                    useHTML: true,
                    formatter: function(){
						var d = new Date(this.x||0),
                            seriesLine = this.point.seriesName||this.point.name||this.series.name + (this.x?' in ' + readableDateFromUtcDate(d, relation.f):'') + ':',
                            value = Highcharts.numberFormat(Math.abs(this.point.y), 0) + ' ' + relation.units,
                            chartWidth = $(this.series.chart.container).width();
                        return _breakInsert(seriesLine, chartWidth)
							+'<br/>'
                            + _breakInsert(value, chartWidth);
                    }
                }
            };
            //4. loop through the relationSeries (note:  setdata must be left outer joined to cubecompents to produce NULL placeholders when missing for certain geographies)
            var point,
                y,
                barOrder,
                stackOrder,
                data = [],
                barFacets  = (relation.bar_facets)?JSON.parse(relation.bar_facets):[],
                stackFacets  = (relation.stack_facets)?JSON.parse(relation.stack_facets):null;
            if(type=='line' || type=='area'){
                //4A. line and area = time series
                relationHighChartOptions.xAxis.type = 'datetime';
                delete  relationHighChartOptions.xAxis.categories;
                for(i=0;i<relationSeries.length;i++){
                    relationHighChartOptions.series.push({
                        data: parseEiaTimeSeriesData(relationSeries[i].data),
                        id: relationSeries[i].series_id,
                        name: _breakInsert(relationSeries[i].categoryName || relationSeries[i].name || ('no data for '+barFacets[i]), chartWidth)
                    });
                }
            } else {
                //4B. pies, bars, and stacked bars
                for(i=0;i<relationSeries.length;i++){
                    barOrder =  parseInt(relationSeries[i].bar_order);
                    stackOrder = parseInt(relationSeries[i].stack_order);
                    y = _seriesValue(relationSeries[i].data, date);
                    if(y===null && relationHighChartOptions.chart.type=='pie') relationHighChartOptions.chart.type = 'bar'; //degrade to bar if a component of a pie chart is missing
                    if(y!==null && !date) date = relationSeries[i].data[0][0];
                    point = {
                        y:  y,
                        name: relationSeries[i].categoryName || 'no data for '+ barFacets[barOrder],
                        seriesName: relationSeries[i].name || 'series does not exist'
                    };
                    data.push(point);
                    if(barOrder == (barFacets.length-1)) {  //barorder and stackorder are 0-based (-1 is used to denote non-exist stack)
                        var serie = {data: data};
                        if(stackFacets) {
                            serie.name = stackFacets[stackOrder];
                        } else {
                            if(relationHighChartOptions.chart.type=='bar') serie.showInLegend = false;  //bars already have category labels
                            //TODO: use geography name when multiple regions are displayed together via CNTL+click action
                        }
                        relationHighChartOptions.series.push(serie);
                        data = [];
                    }
                }
                //add the categories
                for(i=0;i<barFacets.length;i++){
                    relationHighChartOptions.xAxis.categories.push(barFacets[i]);
                }
                //add the date to the subtitle
                relationHighChartOptions.subtitle =  {text: readableDateFromEiaDate(date, relation['f'])};
                if(!stackFacets){
                    relationHighChartOptions.plotOptions.bar.dataLabels.enabled = true;
                }
                if(relationHighChartOptions.chart.type=='pie') delete relationHighChartOptions.yAxis;  //trying to save room (not the cause of the right margin problem, nor is exporting)
            }
            return relationHighChartOptions;
        }
    }
    function updateRelationChart(chart, region){

    }
    function makeMapOptions(callback, map, geoset_id, trackingRegions, initial_regions, start, end, num){
        if(!window.jvm) throw "jVectorMaps not loaded";
        if(!jvm.Map.maps[map]){
            if(!literals.derivedMapDefinitions[map]) {
                throw 'map '+ map + ' is not loaded or defined';
            } else {
                if(!jvm.Map.maps[literals.derivedMapDefinitions[map].derivedFrom]) throw 'map '+map+' is derived from '+literals.derivedMapDefinitions[map].derivedFrom+', which is not loaded';
                _makeMap(map);
            }
        }
        var mapPaths = jvm.Map.maps[map].paths, requestedRegions = [];
        for(var path in mapPaths){
            requestedRegions.push(path);
        }
        if(trackingRegions) requestedRegions = requestedRegions.concat(trackingRegions);
        if(initial_regions) requestedRegions = requestedRegions.concat(initial_regions);
        var setKey = geoset_id+':'+map;
        if(!EIA_grapher.data.geosets[setKey]){
            var apiParams = {
                command: 'geoset',
                geoset_id: geoset_id,
                regions: requestedRegions.join(';')
            };
            if(num) apiParams.num = num;
            if(start) apiParams.start = start;
            if(end) apiParams.end = end;
            callAPI(apiParams, function(eiaData, textStatus, jqXHR){
                    if(!eiaData.geoset) throw 'unable to fetch data for geoset_id='+geoset_id+' and map='+map;
                    EIA_grapher.data.geosets[setKey] = eiaData.geoset;
                    _mapOptions();
            });
        } else {
            _mapOptions()
        }
        var regionValues;

        function _mapOptions(){
            var myGeoset = EIA_grapher.data.geosets[setKey],
                mapRegions = jvm.Map.maps[map].paths,
                lastDate = '',
                regionCode,
                title = _categoriesFromSeries(myGeoset.series);
            myGeoset.setName = myGeoset.setName || title;
            for(regionCode in myGeoset.series){ //necessary in case not all regions have current data
                if(mapRegions[regionCode]){ //don't include tracking regions
                    if(lastDate < myGeoset.series[regionCode].data[0][0]) lastDate = myGeoset.series[regionCode].data[0][0];
                }
            }
            regionValues = getRegionSeries(mapRegions, myGeoset, lastDate);
            var mapOptions = {
                map: map,
                title: myGeoset.setname,
                backgroundColor: '#ffffff',
                regionStyle: {
                    initial: {
                        fill: '#999999'
                    },
                    selected: {
                        "stroke-width": 2,
                        "stroke": 'yellow',
                        fill: null
                    }
                },
                geosetData: myGeoset,
                series: {
                    regions:  [{
                            values: regionValues,
                            scale: ['#b0efff','#001F37']
                        }]
                },
                onRegionTipShow: function(e, el, code){
                    if(myGeoset.series[code]) {

                        el.html(myGeoset.series[code].name+':<br>'+regionValues[code]+' '+myGeoset.units);
                    }
                }
            };
            callback(mapOptions);
        }

        function _makeMap(mapName){ //makes a new map definiation by reconfiguring/merging paths from an existing map
            if(!jvm.Map.maps[mapName]){
                var mapDef = literals.derivedMapDefinitions[mapName];
                jvm.Map.maps[mapName] = $.extend(true, {}, jvm.Map.maps[mapDef.derivedFrom]);
                var newMap = jvm.Map.maps[mapName];
                for(var i=0;i<mapDef.regions.length;i++){
                    var regionDef = mapDef.regions[i];
                    newMap.paths[regionDef.code] = {name: regionDef.name, path: ""};
                    for(var j=0;j<regionDef.components.length;j++){
                        if(newMap.paths[regionDef.components[j]]){
                            newMap.paths[regionDef.code].path += (j==0?'':' ') + newMap.paths[regionDef.components[j]].path;
                        } else {
                            //console.info(regionDef.components[j]+' not found in '+mapDef.derivedFrom);
                        }
                        delete newMap.paths[regionDef.components[j]];
                    }
                }
            }
        }
    }
    function getRegionSeries(mapRegions, myGeoset, mapDate){
        var regionCode, seriesData, i, jvmRegionSeries = {};
        for(regionCode in myGeoset.series){
            if(mapRegions && mapRegions[regionCode]){
                seriesData = myGeoset.series[regionCode].data;
                for(i=0;i<seriesData.length;i++){
                    if(seriesData[i][0]==mapDate){
                        if(seriesData[i][1]!==null){
                            jvmRegionSeries[regionCode] = seriesData[i][1];
                        }
                        break;
                    }
                }
            }
        }
        return jvmRegionSeries;
    }

    function callAPI(params, callback){
        var command = params.command,//required,
        url = 'http://' + publicMethods.server_host + '/' +command+'/?w=' + EIA_grapher.version + '&api_key=' + EIA_grapher.api_key + '&out=jsonp';
        for(var param in params){
            if(param!='command') url += '&' + param + '=' + encodeURIComponent(params[param]);
        }
        var startTime = new Date();
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'jsonp',
            success: function(jsoData){
                var returnTime = new Date();
                if(window.console && window.console.info) console.info(command+' api call total round-trip: '+(returnTime.getTime()-startTime.getTime())+'ms');
                callback(jsoData);
            },
            failure: function(jsoData){if(window.console && window.console.info) console.info(jsoData)}
        });
    }

    if(window.Highcharts)
        (function(HC){ //self contained function to protect namespace
            var InitHighChart_var = {};
            InitHighChart_var.chart_type_supported = ["line", "area", "column", "bar", "pie", "arearange"];
            InitHighChart_var.credits_text = 'Source: Energy Information Administration';
            InitHighChart_var.credits_href = 'http://www.eia.gov';
            InitHighChart_var.chart_type = 'line';

            HC.setOptions({
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                noData: {

                },
                legend: {
                    y: 20
                },
                credits: {
                    text: 'Energy Information Administration', //shorted
                    href: 'http://www.eia.gov'
                },
                exporting: {
                    enabled: false
                }
            });
            var errors = [];	//error messages

            //plot chart based on request object
            HC.wrap(HC.Chart.prototype, 'init', function (proceed, request, callback) {
                var self=this;
                var num = request.eia_num || false; //allow num, start and end to be set in either centrally or series by series
                var start = request.eia_start || false;
                var end = request.eia_end || false;
                var skey;
                var seriesToFetchIds = [];

                //look for requested EIA series IDs
                var hasEmptyEiaSeries = false; //indicate whether addEiaSeries() needs to be called (whether an API call was needed or the series were available in data series cache
                jQuery.each(request.series,function(index, serie){
                    if(serie.eia_series_id && !serie.data){
                        hasEmptyEiaSeries = true;
                        skey = serie.eia_series_id +':num='+num+':start='+start+':end='+end;  //local storage for reuse needs to account for the potential different date range requests
                        if(!EIA_grapher.data.series[skey]) seriesToFetchIds.push(serie.eia_series_id);
                    }
                });


                if(seriesToFetchIds.length){
                    var params = {command: 'series', series_id: seriesToFetchIds.join(';')};
                    if(start) params.start = start;
                    if(end) params.end = end;
                    if(num) params.num = num;
                    callAPI(params, addEiaSeries);
                } else {
                    if(hasEmptyEiaSeries) {
                        addEiaSeries();
                    } else {
                        proceed.call(self, request, callback); //if no EIA series to add, directly call Highcharts
                    }
                }

                //MAIN FUNCTION THAT FILLS IN THE DATA
                function addEiaSeries(apiData){
                    //1. save any newly returned series to the shared data store
                    var s, skey, serie, series_id, eia_series;
                    if(typeof apiData !== 'undefined' && apiData.series){
                        for(s=0;s<apiData.series.length;s++){
                            serie = apiData.series[s];
                            skey = serie.series_id +':num='+num+':start='+start+':end='+end;  //local storage for reuse needs to account for the potential different date range requests
                            EIA_grapher.data.series[skey] = apiData.series[s];
                        }
                    }

                    //2. fill series with eia_series_ids but without data from cache
                    for(s=0;s<request.series.length;s++){
                        if(request.series[s].eia_series_id && !request.series[s].data){
                            series_id = request.series[s].eia_series_id;
                            skey = series_id +':num='+num+':start='+start+':end='+end;  //local storage for reuse needs to account for the potential different date range requests
                            if(eia_series = EIA_grapher.data.series[skey]){
                                request.series[s].data =_parseTimeData(eia_series);
                                if(!request.series[s].name) request.series[s].name =  eia_series.name;
                                //make sure the units have a yAxis and that it is used for this series
                                if(!request.yAxis) request.yAxis = [];
                                var axisExists = false;
                                for(var i=0;i<request.yAxis.length;i++){
                                    if(request.yAxis[i].title && request.yAxis[i].title.text==eia_series.units) {
                                        axisExists = true;
                                        break;
                                    }
                                }
                                if(axisExists){
                                    request.series[s].yAxis = i;
                                } else {
                                    request.yAxis.push({title: {text: eia_series.units}});
                                    request.series[s].yAxis = i;  //which is = old length = new length -1
                                }
                            }
                        }
                    }

                    //request.title = request.title || { text: chart_title	}; //set title based on setting
                    request.lang = request.lang || { noData: "No data" };
                    request.noData = request.noData || {  //default Highcharts message if no data available
                        style: {
                            fontWeight: 'bold',
                            fontSize: '15px',
                            color: '#303030'
                        }
                    };
                    request.tooltip = request.tooltip || {
                        crosshairs: true,
                        useHTML: true,
                        pointFormat: "{series.name}: <b>{point.y}</b><br/>"
                    };

                    request.xAxis = request.xAxis || { type: 'datetime'	};	//set xaxis options
                    proceed.call(self, request, callback);


                    function _parseTimeData(eia_series){
                        //put that thing down, slice() it and reverse() it
                        var series_data_arr = eia_series.data.slice(0).reverse(),
                            point, convertedDate, j, y;

                        var datetime_value = []; //init array of converted datetime values
                        for (j=0;j<series_data_arr.length;++j) { //for each point in the series
                            point = String(series_data_arr[j]).split(','); //init individual point array
                            convertedDate = utcDateFromEiaDate(point[0]);
                            y = point[1];
                            datetime_value.push([convertedDate, isNaN(y)? null : parseFloat(y)]);
                        }
                        return datetime_value;
                    }
                }
            });


            /**
             * Javascript utility supportive functions
             */

                //convert number to comma formatted number - as money format
            function numberWithCommas(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            }

            function escapeRegExp(string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }

            //adding JavaScript trim() if not available : specially for IE browser
            if(typeof String.prototype.trim !== 'function') {
                String.prototype.trim = function() {
                    return this.replace(/^\s+|\s+$/g, '');
                }
            }

        }(Highcharts));

    function utcDateFromEiaDate(eiaDate, localTime){
        var theYear, theMonth, theDay;
        theYear = Number(eiaDate.substr(0,4));
        theMonth = Number(eiaDate.length >= 6 ? (  // must handle quarterly dates too
            eiaDate.substr(4,1) == 'Q'?3*(parseInt(eiaDate.substr(5,1))-1)+1:eiaDate.substr(4,2)
            ):'01');
        theDay = Number(eiaDate.length >= 8 ? eiaDate.substr(6,2) : '01');
        return localTime ? new Date(parseInt(theYear), parseInt(theMonth)-1, parseInt(theDay)) : Date.UTC(parseInt(theYear), parseInt(theMonth)-1, parseInt(theDay));
    }
    function readableDateFromUtcDate(utcDate, freq){  //used in tool tips
        var utcYear = utcDate.getUTCFullYear(),
            utcMonth = utcDate.getUTCMonth(),
            utcDay = utcDate.getUTCDate();
        switch(freq||'D'){
            case 'A':
                return utcYear;
            case 'Q':
                return utcYear+'-Q'+(Math.floor(utcMonth/3)+1);
                break;
            case 'M':
                return utcYear+'-'+(utcMonth<9?'0':'')+(utcMonth+1);
            default:  //weekly, daily and undefined
                return utcYear+'-'+(utcMonth<9?'0':'')+(utcMonth+1)+'-'+(utcDay<10?'0':'')+utcDay;
        }
    }
    function readableDateFromEiaDate(eiaDate, frequency){
        var theYear, theMonthQuarter, theDay, theHour;

        var ret = '';

        theYear = eiaDate.substr(0,4);
        theMonthQuarter = eiaDate.substr(4,2);
        theDay = eiaDate.substr(6,2);
        theMonthQuarter = eiaDate.length >= 6
            ? (eiaDate.substr(4,1) == 'Q'?eiaDate.substr(4,2): literals.monthNames[parseInt(eiaDate.substr(4,2))])// must handle quarterly dates too
            :'';
        theDay = eiaDate.length >= 8 ? eiaDate.substr(6,2) : '';
        theHour = eiaDate.length >= 12 ? eiaDate.substr(9,2) : '';

        switch(frequency.toUpperCase()) {
            case 'W':
                ret = 'Week of ' + theMonthQuarter + ' ' + parseInt(theDay) + ', ' + parseInt(theYear);
                break;
            case 'H':
                ret = theMonthQuarter + ' ' + parseInt(theDay) + ', ' + parseInt(theYear) + ' ' + parseInt(theHour) + ':00';
                break;
            case 'Q':
                ret = theMonthQuarter + ' ' + parseInt(theYear);
                break;
            case 'M':
                ret = theMonthQuarter + ' ' + parseInt(theYear);
                break;
            case 'D':
                ret = theMonthQuarter + ' ' + parseInt(theDay) + ', ' + parseInt(theYear);
                break;
            case 'A':
                ret = parseInt(theYear);
                break;
            case '4':
                ret = '4-week average ending ' + theMonthQuarter + ' ' + parseInt(theDay) + ', ' + parseInt(theYear);
                break;
            default:
                ret = theDay + theMonthQuarter + theYear;
        }

        return ret.toString();
    }

    function parseEiaTimeSeriesData(data){
        var x, i, parsedData = null;
        if(data!==null){
            parsedData = [];
            for(i=0;i<data.length;i++){
                x = data[i][0];
                if(x.length){
                    parsedData.push([utcDateFromEiaDate(x), data[i][1]]);
                }
            }
            parsedData.sort(function(a,b){return a[0] - b[0]});
        }

        return parsedData;
    }


    function _showRegionSeries(relationChart, geosetData, regionCode){
        // relationChart is either a chart object or a integer width
        var seriesOptions = {
            data: parseEiaTimeSeriesData(geosetData.series[regionCode].data),
            id: regionCode,
            name: _breakInsert(geosetData.series[regionCode].categoryName||geosetData.series[regionCode].name, isNaN(relationChart)?$(relationChart.container).width(): relationChart)
        };
        if(isNaN(relationChart)) { //if chart object is provided, add the series
            if(relationChart.options.colors && relationChart.options.colors.length) seriesOptions.color = relationChart.options.colors[relationChart.series.length];
            relationChart.addSeries(seriesOptions);
        }
        return seriesOptions;
    }
    function _categoriesFromSeries(series){ //returns an array of the unique word cores from the series' names, stripping off common words from the beginning and ends of the string
        var s, nonNullSeries;
        //create the local list
        for(s in series){
            if(series[s].name) {
                series[s].categoryName = series[s].name.split(' ');
                nonNullSeries = series[s];
            }
            //coredNames.push(series[i].name);
        }
        var titleStartWords = _removeCommonStartWords();
        _reverse(); //reverse order so we can from common words from the end of the series name
        var titleEndWords = _removeCommonStartWords();
        _reverse(true);  //reverse again = normal order and rejoin array into a string
        return titleStartWords.concat(titleEndWords.reverse()).join(' ');

        function _removeCommonStartWords(){
            var s, word, isCommon, titleWords = [];
            while(nonNullSeries.categoryName.length){
                word = nonNullSeries.categoryName[0];
                isCommon = true;
                for(s in series){
                    if(series[s].categoryName && series[s].categoryName[0]!=word) {
                        isCommon = false;
                        break;
                    }
                }
                if(isCommon){
                    titleWords.push(word);
                    for(s in series){
                        if(series[s].categoryName) series[s].categoryName.shift();
                    }
                } else {
                    break;
                }
            }
            return titleWords;
        }
        function _reverse(rejoinToString){
            for(var s in series){
                if(series[s].categoryName){
                    series[s].categoryName.reverse();
                    if(rejoinToString) {
                        series[s].categoryName = series[s].categoryName.join(' ');
                        while(nonWordPat.test(series[s].categoryName.substr(-1,1)))
                            series[s].categoryName = series[s].categoryName.substr(0, series[s].categoryName.length - 1);  //remove trailing spaces and punctuation
                    }
                }
            }
        }
    }
    function _seriesValue(data, date){
        var point, i;
        if(data) {
            if(date){
                for(i=0;i<data.length;i++){
                    point = data[i];
                    if(point[0]==date){
                        return point[1];
                    }
                }
            } else {
                point = data[0];  //EIA returns series data in reverse chronological order
                if(point) return point[1];
            }
        }
        return null;
    }
    function _breakInsert(label, chartWidth){ //used to insert line break <br> into series and category names likely to overflow
        var pointsPerChar = 500/70;  //approximate average points per char
        var margins = 0;
        var maxChars = (chartWidth-margins)/pointsPerChar;
        if(label.length>maxChars){
            var firstLine = label.split(' '), secondLine = [];
            while(firstLine.join(' ').length>maxChars){
                secondLine.unshift(firstLine.pop());
            }
            firstLine = firstLine.join(' ');
            secondLine = secondLine.join(' ');
            secondLine = _breakInsert(secondLine, chartWidth);  //break again if necessary
            label = firstLine + '<br> ' + secondLine;
        }
        return label;
    }
    function visualizationReady($eiaVisualization, fetchedData, type, optionsObject){//overwrite EIA_grapher.visualizationComplete with custom callback if needed to provide post data fetch processing or map/chart optionsObject modification
        // $eiaVisualization: jQuery object of the visualization DIV for this callback
        // fetchedData:  the series, relation, or geoset data object returned (will be null for interactive map-chart with mouse-over interaction that do not fetched supplemental data)
        // type = 'chart' or 'map' or 'relation' string literal
        // optionsObject: depending on type, will be an assembled Highcharts options object or a jVectormap options object, prior to drawing the graph or map
    }

    //returned functions are public functions
    var publicMethods =  {
        version: 0.6,
        drawAllVisualizations: drawAllVisualizations,
        drawDivVisualization: drawDivVisualization,
        makeMapOptions: makeMapOptions,
        makeRelationChartOptions: makeRelationChartOptions,
        parseEiaTimeSeriesData: parseEiaTimeSeriesData,
        literals: literals,
        utcDateFromEiaDate: utcDateFromEiaDate,
        readableDateFromEiaDate: readableDateFromEiaDate,
        api_key: '', //'API_KEY_REQUIRED',
        server_host: 'api.eia.gov',
        data: {
            geosets: {},
            series: {},
            relations: {}
        },
        visualizationReady: visualizationReady //overwrite EIA_grapher.visualizationComplete with custom callback if needed to provide post data fetch processing or map/chart optionsObject modification
            // visualizationReady input parameters:
            //   $eiaVisualization: jQuery object of the visualization DIV for this callback
            //   data:  the series, relation, or geoset data object returned
            //   type = 'chart' or 'map' or 'relation' string literal
            //   optionsObject: depending on type, will be an assembled Highcharts options object or a jVectormap options object, prior to drawing the graph or map
    };
    return publicMethods;

}();

$(document).ready(function(){
    jQuery.support.cors = true;
   EIA_grapher.drawAllVisualizations();
});


