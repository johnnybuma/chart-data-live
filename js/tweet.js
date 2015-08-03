(function ($) {
    $('button').on('click', function () {
      
      $.getJSON('https://api.twitter.com/1.1/trends/available.json', function (data) {
        
        console.log('success!');
      });
    }) 
    });                   