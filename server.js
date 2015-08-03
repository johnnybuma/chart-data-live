var express=require('express');
/*var static = require("serve-static");*/
var app=express();




/*
SMTP Server Configuration.
*/

/*------------------SMTP Over-----------------------------*/



app.use(
     "/",
     express.static(__dirname)
);




/*------------------Routing Started ------------------------*/



app.get('/',function(req,res){
	res.sendfile('index.html');
});




/*--------------------Routing Over----------------------------*/

/*app.listen(3000,function(){
console.log("Express Started on Port 3000");
});
*/

app.listen(process.env.PORT || 3000); 

console.log("Express Started on Port 3000")
