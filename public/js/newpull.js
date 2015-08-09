(function ($) {
    $('button').on('click', function () {
        // remove resultset if this has already been run
        $('.content ul').remove();
        // add spinner to indicate something is happening
        $('<i class="fa fa-refresh fa-spin"/>').appendTo('body');
        
        // get selected zip code from selectbox
        var zip = $('select option:selected').text().substring(1, 6);

        // make AJAX call
        $.getJSON('http://api.eia.gov/category/?api_key=33286745501E59DF160860DFFA09AD36&category_id=38A', function (data) {
            
            // do all this on success       
            var items = [],
                $ul;
            console.log(data);
            for (var i = 0; i < data.category.childseries.length; i++) {
              var newName = data.category.childseries[i];
              var catId = newName.series_id;
              console.log(newName);
            
            items.push('<li id="' + newName + '"><span class="name">' + catId + '</span><br><span class="addr">' + newName.units + '</span> <span class="city">' + newName.updated + '</span></li>');
            }

          
            

            
            console.log("success!");
            // if no items were returned then add a message to that effect
            if (items.length < 1) {
                items.push('<li>Failure, try again!</li>');
            }
            
            // remove spinner
            $('.fa-spin').remove();
            
            // append list to page
            $ul = $('<ul />').appendTo('.content');
            
            //append list items to list
            $ul.append(items);
        });
    });
}(jQuery));