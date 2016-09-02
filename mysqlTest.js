var mysql = require('mysql');

var connection = mysql.createConnection({
//properties...
	host: 'localhost',
	user: 'root',
	password: 'PMT@mysql1',
	database: 'helpscoutapi'

})

connection.connect(function(err){
	if(!!err){
		console.log('Error');
	}else{
		console.log('Connected');
		connection.query("SELECT * FROM ost_canned_response", function(err, rows, fields){
			if(!!err){
				console.log('Query error:\n', err);
			}else{
				console.log(rows);
			}
		});
	}
	connection.end(function(err){
		console.log('Conneciton Closed');
	});
});

