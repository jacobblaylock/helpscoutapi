exports.getPages = function helpscoutGetPages(startDate, endDate, page, callback){
	if(typeof callback === 'undefined'){
		callback = page;
		page = 1;
	}
	var search = '/v1/search/conversations.json?query=(status:"closed"%20AND%20mailboxid:79656%20AND%20' +
				'modifiedAt:['+startDate.toISOString()+'%20TO%20'+endDate.toISOString() + '])&page='+page;
	helpscoutQuery(search, function(data){
		callback(data);
	});	
}


exports.getThread = function helpscoutGetThread(conversationId, callback){
	var search = 'https://api.helpscout.net/v1/conversations/'+conversationId+'.json';
	helpscoutQuery(search, function(data){
		callback(data);
	});		

}

exports.insertTickets = function helpscoutInsertTickets(thread){
	var query;
    var clientId = 'NA';  //Default to NA;
    var clientName;
    var threadBody;
    var billableHours = 0;
    thread.item.customFields.forEach(function(cf){
    	if(cf.name === 'Client'){
    		clientId = cf.value;
    	}else if(cf.name === 'Billable Hours'){
    		billableHours = cf.value;
    	}
    });
    if(!billableHours){
    	console.log('NO HOURS INPUT');
    	billableHours = 0;
    }

	clientName = helpscoutClientMap(clientId);
	threadBody = helpscoutGetTicketBody(thread.item.threads);
	query = "call helpscoutInsert("+
		thread.item.number+",'"+thread.item.closedAt.replace(/T|Z/g, ' ')+"','"+thread.item.closedBy.firstName+"','"+thread.item.closedBy.lastName+"','"+
		clientName+"','"+thread.item.subject+"','"+thread.item.status+"','"+thread.item.createdAt.replace(/T|Z/g, ' ')+"','"+thread.item.modifiedAt.replace(/T|Z/g, ' ')+"','"+
		threadBody+"','"+billableHours+"')";	
	helpscoutMysqlQuery(query);	
	//console.log('Query: ', query);
}

function helpscoutQuery(query, callback){
	var https = require('https');

	var options = {
		hostname: 'api.helpscout.net',
		path: query,
		auth: '838f6de2a34d17e1c430486b732e25a74a55bad5:X'
	}

	var req = https.request(options, (res) => {
		if(res.statusCode != '200'){
			console.log('statusCode:', res.statusCode);
			//console.log('headers:', res.headers);	 
			var wait = parseInt(res.headers["retry-after"]) + 1;
			console.log('Retry After: ', wait.toString()); 	
			console.log('QUERY: ', query);
		}else{
			var buffer = "";
			res.on('data', (d) => {
				buffer += d;
			});
			res.on("end", (err) =>{
				callback(JSON.parse(buffer));
			});
		}
	});	  

	req.end();

	req.on('error', (e) => {
		console.error('https request error', e);
		console.log('QUERY: ', query);
	});

}

function helpscoutMysqlQuery(query){
	var mysql = require('mysql');

	var connection = mysql.createConnection({
	//properties...
		host: 'localhost',
		user: 'root',
		password: 'PMT@mysql1',
		database: 'helpscoutapi'

	});

	connection.connect(function(err){
		if(!!err){
			console.log('Error');
		}else{
			console.log('Connected');
			connection.query(query, function(err){
				if(!!err){
					console.log('QUERY ERROR:\n', 'Query: ', query, '\nError: ', err, '\n');
				}else{
					console.log('Query successful');
				}
			});
		}
		connection.end(function(err){
			console.log('Connection Closed');
		});
	});	
}

function helpscoutGetTicketBody(threads, callback){
	var striptags = require('striptags');
	var text = '';
    threads.forEach(function(t){
    	if(t.body !== null){
    		text = text +
            t.createdAt + '  (' + t.createdBy.firstName + ' ' + t.createdBy.lastName + '):\n\n' +
            striptags(t.body.replace(/<br>/g, '\n')) + '\n\n';
    	}
    });
    return text.replace(/'/g, "''");
}

function helpscoutClientMap(clientId){
	var clientName;
	switch (clientId){
		case '5718':
			clientName = 'POPLAR HEALTHCARE MGMT';
			break;
		case '5719':
			clientName = 'PUGET SOUND INSTITUTE OF PATHOLOGY';
			break;
		case '5720':
			clientName = 'BAKO PATHOLOGY';
			break;
		case '5721':
			clientName = 'PATHOLOGY ASSOCIATES-FRESNO';
			break;	
		case '5722':
			clientName = 'ABCODIA';
			break;
		case '5723':
			clientName = 'NYU';
			break;
		case '5724':
			clientName = 'CENTRAL OREGON PATHOLOGY CONSULTANTS';
			break;										
		case '5725':
			clientName = 'BIO-PATH MEDICAL GROUP';
			break;	
		case '5726':
			clientName = 'INCYTE';
			break;
		case '5727':
			clientName = 'CELLNETIX';
			break;
		case '5728':
			clientName = 'OHSU';
			break;
		case '5729':
			clientName = 'DAHL-CHASE DIAGNOSTIC SERVICES';
			break;
		case '5731':
			clientName = 'OTHER';
			break;															
		default:
			clientName = 'OTHER';
	}
	return clientName;
}