var callSeries;
var options = {
                    chart: {
                      
                        renderTo: 'container',
                        type: 'line'
                    },
                    title: {
                      text: "Energy Revenue"
                    },
                    xAxis: {
                      type: 'category',
                      reversed: true
                    },
                    yAxis: {
                      title: {
                        text: 'Million Dollars'
                      }
                      
                      //plotLines: [{
                      //    value: 0,
                      //    width: 1,
                      //    color: '#808080'
                      //}]
                    },
                    series: [{
                      //name: [],
                      //data: []
                    }]
                };
  
var shit = [];
var chart;
(function ($) {
  //var chart;
    // make api call on select
    //$('#duration').on('change', function () {
      $('#fetch').on('click', function () {
      
        
      
        // remove resultset if this has already been run
        $('.content ul').remove();
        // add spinner to indicate something is happening
        $('<i class="fa fa-spinner fa-spin"/>').appendTo('body');
        
        // get selected zip code from selectbox
         state = $('#states option:selected').val();
         fullState = $('#states option:selected').text();
          console.log(state);
         duration = $('#duration option:selected').val();
          console.log(duration);
          console.log('key');
              //options.series[0].name.push(state);
         newMan = {
                    name: fullState,
                    color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                    data: []
                  };
        // make AJAX call
        $.getJSON('http://api.eia.gov/series/?api_key=33286745501E59DF160860DFFA09AD36&series_id=ELEC.REV.' + state + '-RES.' + duration, function (data) {
            
            // do all this on success       
            var items = [],
                $ul;
            console.log(data);
            
            // loop through raw api data and define variables
            for (i = 0; i < data.series.length; i++) {
              //edit review
              callSeries = data.series[i];
              catId = callSeries.units;
              console.log(callSeries);
              console.log(callSeries.data);
              console.log(catId);
               seriesDone = [];
              
              for (j = 0; j < callSeries.data.length; j++) {
               
               
                
                seriesDone.push(callSeries.data[j][1]);
                console.log(callSeries.data[j][0]);  
                seriesLine = callSeries.data[j];
                // New Lines of code
                seriesNow = seriesLine[1];
                seriesDone = seriesNow.toString().split(".");
                                console.log(seriesDone[1]);

                // end -- was seriesLine
                console.log(seriesLine);
                
               
                  console.log(newMan.data);
                  newMan.data.push(seriesLine);
                  
                  
                
                  console.log(options.series);
                  //options.series[0].data.push(seriesLine);

                  

                
                items.push('<li id="' + callSeries + '"><span class="name">' + seriesLine[0].substring(0,4) + " " + seriesLine[0].substr(4,10) + '</span><br><span class="addr">' + seriesDone[0] + '</span> <span class="city">' + catId + '</span></li><hr>');
                
              } 
              
            }
            options.series.push(newMan);
            chart = new Highcharts.Chart(options);
            
               
          
            console.log("success!");
            // if no items were returned then add a message to that effect
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
      
       
      
      
    });
  
  
  

    

}(jQuery));


$('#reset').on('click', function () {
                while(chart.series.length > 0)
                //for(i in chart.series) 
                {
                    //chart.series[i].remove(true);
                    options.series = [];
                      chart.series[0].remove(true);
                    console.log(options.series);
                }
                  
            });          