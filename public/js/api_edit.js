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
                text: 'Million Dollars'
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
                text: 'Million KWH'
            },
            labels: {
                format: '{value} KWH'
            },
            opposite: true
        },
        {//Third Axis
            title: {
                text: "Cents Per KWH"
            },
            labels: {
                format: '${value}'
            }
        },
        {//Population Axis
            title: {
                text: "Population"
            },
            labels: {
                format: '{value}'
            },
            opposite: true
        }
    ],
    tooltip: {
        shared: true
    },
    series: [{}]
};
//Hide Chart and Data View Elements
$('#container').hide();
$('.list').hide();
$('#calculate').hide();


// get selected data from select boxes
thistype = $('#sale-rev option:selected').val();
fulltype = $('#sale-rev option:selected').text();
var state = $('#states option:selected').val();
fullState = $('#states option:selected').text();
price = $('#sale-rev option:selected').val();
$('#state-title').html(fullState + " " + "Data List &blacktriangledown;");
duration = $('#duration option:selected').val();


//***Where functions were
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
    } else {
        return " Cents/KWH"
    }
};

//Set yAxis based on sales or revenue data
var setaxis = function () {
    if (thistype == 'REV') {
        return 0;
    } else if (thistype == 'SALES') {
        return 1;
    } else {
        return 2;
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
    color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16),
    data: [],
    yAxis: setaxis(),
    type: setType(),
    tooltip: {
        valueSuffix: setSuffix()
    }
};


var url = 'http://api.eia.gov/series/?api_key=33286745501E59DF160860DFFA09AD36&series_id=ELEC.' + thistype + '.' + state + '-RES.' + duration;
// make AJAX call




//***API CALLS TO SEPARATE ***////

var getPopulation = function () {

    state = $('#states option:selected').val();
    fullState = $('#states option:selected').text();

    //Population Data API
    var popurl = "https://www.quandl.com/api/v3/datasets/FRED/" + state + "POP.json?start_date=2000-12-31"

    console.log(popurl);


    //Population Specific Object
    newPop = {
        name: fullState,
        color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16),
        data: [],
        yAxis: 3,
        type: 'line'

    };


    $.getJSON(popurl, function (data2) {
        console.log(data2);
        console.log(data2.dataset.data[0]);
        var popdata = data2.dataset.data;
        for (i = 0; i < popdata.length; i++) {
            thispopdata = popdata[i];
            console.log(thispopdata);
            newPop.data.push(thispopdata);


        }
    });//**End of Population Call

    // remove spinner
    $('.fa-spin').remove();
    options.series.push(newPop);
    console.log(newPop);
    chart = new Highcharts.Chart(options);

};

var getEia = function () {
    $.getJSON(url, function (data) {

        //set y-axis


        // Declare list data array
        var items = [],
            $ul;

        // loop through raw api data and declare variables
        for (i = 0; i < data.series.length; i++) {
            callSeries = data.series[i];
            catId = callSeries.units;
            seriesDone = [];
            //Fix to account for differing series length when calculating percent increase
            var secondNum = callSeries.data.length - 1;
            console.log(secondNum);
            change = rincrease(callSeries.data[0][1], callSeries.data[secondNum][1]);//NEW CODE!!
            formattedChange = change.toString().slice(0, 5);
            console.log(formattedChange);
            $('#calculate').append(fullState + '\'s ' + fulltype + ' has increased by ' + formattedChange + '%' + ' since 2001' + '<br>');
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
        options.series.push(newMan);


    });///*** End of EIA Call
};// End EIA Function

(function ($) {
    //Ensure that the series begins with created data, removes empty series object that was displaying on first call  
    options.series = [];
    //Execute all this on click of fetch button
    $('#fetch').on('click', function () {
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



        //getPopulation();

        if (thistype == 'POP') {
            getPopulation();
        } else {
            getEia();
        }


        //Push constructed series data to highcharts object

        //Debug
        console.log(options.series);
        //Set up chart with declared data (options)//
        chart = new Highcharts.Chart(options);

        //Verify all went according to plan
        console.log("success!");


    });
}(jQuery));

//Reset chart series data to empty and clear chart 
$('#reset').on('click', function () {
    while(chart.series.length > 0)
    {
        options.series = [];
        chart.series[0].remove(true);
        $('#jombo').show();
        $('#container').hide();
        $('.list').hide();
        $('#calculate').empty().hide();
    }
});          