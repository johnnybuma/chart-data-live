var options =
{
    chart: {
        renderTo: 'container',
        type: 'line',
        zoomType: 'x'
    },
    title: {
        text: "Residential Energy Data"
    },
    subtitle: {
        text: "Click and drag over chart to zoom"
    },
    credits: {
        enabled: true,
        href: "http://www.eia.gov",
        text: "EIA.GOV"
    },
    xAxis: {
        type: 'category',
        reversed: true
    },
    yAxis: [
        {
            title: {
                text: 'Million Dollars',
                style: {

                }
            },
            labels: {
                format: '${value}',
                style: {
                    color: '#000000'
                }
            }
        },
        { //secondary axis for sales
            gridlinewidth: 1,
            title: {
                text: 'Million KWH',
                style: {

                }
            },
            labels: {
                format: '{value} KWH'
            },
            opposite: true
        },
        {//Third Axis
            title: {
                text: "Cents Per KWH",
                style: {

                }
            },
            labels: {
                format: '${value}'
            }
        },
        {// Fourth Axis for Population
            title: {
                text: "Population in K",
                style: {

                }
            },
            labels: {
                format: '{value} k'
            },
            opposite: true
        }
    ],
    tooltip: {
        shared: true
    },
    series: [{}]
};

hideOption = $("<option value='POP'>Population</option>");

//Hide Chart and Data View Elements
$('#container').hide();
$('.list').hide();
$('#calculate').hide();
//$('#duration').hide();
$('#sale-rev').hide();
$('#duration').hide();
$('#fetch').hide();
$('#reset').hide();



//var firstType = $('#sale-rev option:selected').val();
$(document).ready(function() {


    $('#states').on('change', function () {
        $('#duration'). show();
        $('#fetch').show();
        $('#reset').show();
    });
  
  
    $('#duration').on('change', function () {
        var duration = $('#duration option:selected').val();

        if (duration === 'A') {
            $('#sale-rev').append(hideOption);
        } else {
            $('#sale-rev option[value="POP"]').remove();
        }
        $('#sale-rev').show();

    });
    

});



var resetChart = function () {
//Reset chart series data to empty and clear chart
    $('#reset').on('click', function () {
        while (chart.series.length > 0) {
            options.series = [];
            chart.series[0].remove(true);
            $('#jombo').show();
            $('#container').hide();
            $('.list').hide();
            $('#calculate').empty().hide();
            $('#sale-rev').hide();
            $('#duration').hide();
            $('#states').prop('selectedIndex',0);
            $('#sale-rev').prop('selectedIndex',0);
            $('#duration').prop('selectedIndex',0);
            options.yAxis[0].title.style.color = '#000000';
            options.yAxis[1].title.style.color = '#000000';
            options.yAxis[2].title.style.color = '#000000';
            options.yAxis[3].title.style.color = '#000000';

        }
    });
};


//checkType();
(function ($) {
    //Ensure that the series begins with created data, removes empty series object that was displaying on first call
  
    
    resetChart();
    options.series = [];
    //Execute all this on click of fetch button
    $('#fetch').on('click', function () {
        //Hide duration after initial call
        $('#duration').hide();
        //Show Chart and Data View Elements
        $('#container').show();
        $('.list').show();
        $('#calculate').show();
        // remove resultset if this has already been run
        $('.content ul').remove();
        //Remove Jumbotron Instructions
        $('#jombo').hide();
        // add spinner to indicate something is happening
        $('<i class="fa fa-cog fa-1 fa-spin" style="float: left;"/>').prependTo('#spinning');

        // get selected data from select boxes
        thistype = $('#sale-rev option:selected').val();
        fulltype = $('#sale-rev option:selected').text();
        state = $('#states option:selected').val();
        fullState = $('#states option:selected').text();
        price = $('#sale-rev option:selected').val();
        duration = $('#duration option:selected').val();

        $('#state-title').html(fullState + " " + "Data List &blacktriangledown;");

        //Hide Population Function

        var hidePop = function () {
            if (duration == 'A') {
                $("#sale-rev option[value='A']").hide();
            } else {
                $("#sale-rev option[value='A']").show();
            }
        };

        hidePop();
        //Calculate Percent Increased
        var rincrease = function (one, two) {
            var diff = one - two;
            var change = (diff / one) * 100;
            return change;
        }

        //Set Suffix by Data Type
        var setSuffix = function () {
            if (thistype == 'REV') {
                return " $"
            } else if (thistype == 'SALES') {
                return " KWH"
            } else if (thistype == 'PRICE') {
                return " Cents/KWH"
            } else {
                return ' K'
            }
        };

        //Set yAxis based on sales or revenue data
        var setaxis = function () {
            if (thistype == 'REV') {
                return 0;
            } else if (thistype == 'SALES') {
                return 1;
            } else if (thistype == 'PRICE') {
                return 2;
            } else {
                return 3;
            }
        };
        //Set chart type by sales or revenue data
        var setType = function () {
            if (thistype == 'REV') {
                return 'column'
            } else {
                return 'line'
            }
        };

        // Set-up object for highchart series array
        newMan = {
            name: fullState,
            //color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
            data: [],
            yAxis: setaxis(),
            type: setType(),
            tooltip: {
                valueSuffix: setSuffix()
            }


        };

        //set colors
        thisAxis = setaxis();
        seriesColor = (Math.random()*0xFFFFFF<<0).toString(16);
        newMan.color = '#' + seriesColor;
        options.yAxis[thisAxis].title.style.color = '#' + seriesColor;

        var popurl = "https://www.quandl.com/api/v3/datasets/FRED/" + state + "POP.json?start_date=2000-12-31";

        var url = 'http://api.eia.gov/series/?api_key=33286745501E59DF160860DFFA09AD36&series_id=ELEC.' + thistype + '.' + state + '-RES.' + duration;

        var eiaCall = function () {

            $.getJSON(url, function (data) {


                // Declare list data array
                var items = [],
                    $ul;

                // loop through raw api data and declare variables
                for (i = 0; i < data.series.length; i++) {
                    callSeries = data.series[i];
                    catId = callSeries.units;
                    seriesDone = [];
                    change = rincrease(callSeries.data[0][1], callSeries.data[13][1]);//NEW CODE!!
                    formattedChange = change.toString().slice(0, 5);
                    console.log(formattedChange);
                    $('#calculate').append(fullState + '\'s ' + fulltype + ' has increased by ' + formattedChange + '%' + ' since 2001' + '<br><hr>');
                    //End New Code TODO: make sure this shit works!
                    for (j = 0; j < callSeries.data.length; j++) {
                        seriesDone.push(callSeries.data[j][1]);
                        seriesLine = callSeries.data[j];
                        seriesNow = seriesLine[1];
                        seriesDone = seriesNow.toString().split(".");
                        //send data to json object for chart
                        var myYear = seriesLine[0];
                        var myVal = Number(seriesDone[0]);
                        var fuckThis = [];
                        fuckThis.push(myYear);
                        fuckThis.push(myVal);
                        console.log(fuckThis);
                        newMan.data.push(fuckThis); //Was seriesLine *Less Acurate with fuckThis
                        //Push data to list array
                        items.push('<li id="' + callSeries + '"><span class="name">' + seriesLine[0].substring(0, 4) + " " + seriesLine[0].substr(4, 10) + '</span><br><span class="addr">' + seriesDone[0] + '</span> <span class="city">' + catId + '</span></li><hr>');

                    }//end for loop j
                }//end for loop i

                //Push constructed series data to highcharts object
                options.series.push(newMan);
                //Set up chart with declared data (options)//
                chart = new Highcharts.Chart(options);

                //Verify all went according to plan
                console.log("success!");

                // if no data returned then add a message to that effect
                if (items.length < 1) {
                    items.push('<li>Failure, try again!</li>');
                }

                // remove spinner
                $('.fa-spin').remove();

                // append list to page
                $ul = $('<ul class="data-list"> </ul>').appendTo('.panel-body');

                //append list items to list
                $ul.append(items);
            });
        };//End Eia Call Function
        var popCall = function () {
            $.getJSON(popurl, function (data2) {

                // Declare list data array
                var items = [],
                    $ul;

                console.log(data2);
                console.log(data2.dataset.data[0]);
                var popdata = data2.dataset.data;
                var popNum = popdata.length - 1;
                var popChange = rincrease(popdata[0][1], popdata[popNum][1]);
                var formattedPop = popChange.toString().split('.');
                console.log(formattedPop);
                console.log(popdata);
                console.log(popNum);
                console.log(popChange);
                $('#calculate').append(fullState + '\'s ' + fulltype + ' has increased by ' + formattedPop[0] + '%' + ' since 2001' + '<br><hr>');

                for (i = 0; i < popdata.length; i++) {
                    thispopdata = popdata[i];
                    console.log(thispopdata);
                    newMan.data.push(thispopdata);
                    items.push('<li id=""><span class="name">' + thispopdata[0] + '</span><br><span class="city">' + thispopdata[1] + '</span></li><hr>');

                }

                //Push constructed series data to highcharts object
                options.series.push(newMan);
                //Set up chart with declared data (options)//
                chart = new Highcharts.Chart(options);

                //Verify all went according to plan
                console.log("success!");
                $ul = $('<ul class="data-list"> </ul>').appendTo('.panel-body');
                $ul.append(items);

                // remove spinner
                $('.fa-spin').remove();

            });//**End of Population Call
        };

        var chooseCall = function () {
            if (thistype == 'POP') {
                popCall();
            } else {
                eiaCall();
            }
        };

        chooseCall();
    });
}(jQuery));

