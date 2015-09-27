var express=require('express');
var secret=require('secret');
var app=express();



/*
SMTP Server Configuration.
*/

/*------------------SMTP Over-----------------------------*/

//secret.set('key','33286745501E59DF160860DFFA09AD36');

app.use(
     "/",
     express.static(__dirname + '/public')
);


/*------------------Routing Started ------------------------*/



app.get('/',function(req,res){
  //res.send(secret.get('key'));
	res.sendfile('index.html');
});

//app.get('/colorado',function(req,res){
//  res.sendfile('colorado');
//});



/*--------------------Routing Over----------------------------*/

/*app.listen(3000,function(){
console.log("Express Started on Port 3000");
});
*/

app.listen(process.env.PORT || 3000); 

console.log("Express Started on Port 3000")
