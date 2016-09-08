var helpscout = require('./lib/helpscout.js');
var filewriter = require('./lib/filewriter.js');


var page = 1;
var now = new Date();
var startDate = new Date(now.getFullYear(), now.getMonth());
var endDate = new Date(now.getFullYear(), now.getMonth()+1);

console.log('Pulling all tickets closed from ', startDate, ' to ', endDate);

(function loop(){
	var wait = 1;
	if(page > 1){wait = 20;};
	setTimeout(function(){
		helpscout.getPages(startDate, endDate, page, function(r){
			var countStart = 50*page-49;
			var countEnd = 50*page;
			if(countEnd > r.count){countEnd = r.count};
			console.log('page ', page, ' of ', r.pages, '. Ticket ', countStart, '-', countEnd, ' of', r.count, '...');
			r.items.forEach(function(i){
				helpscout.getThread(i.id, function(t){
					//filewriter.writeThreadsToFile(t);
					helpscout.insertTickets(t);

				});
			});
			if(page < r.pages){
				page++;
				loop();
			};
		});
	}, wait*1000);
}());


