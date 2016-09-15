//Get Modules
var helpscout = require('./lib/helpscout');
var filewriter = require('./lib/filewriter');

//Declare Variables
var page = 1;
var now = new Date();
var startDate = new Date(now.getFullYear(), now.getMonth());
var endDate = new Date(now.getFullYear(), now.getMonth()+1);

console.log('Pulling all tickets closed from ', startDate, ' to ', endDate);

//Loop through each page of a Helpscout result set, get all the conversation ID's, and use those to get the thread data. Starts at Page 1.
(function loop(){
	/*No wait time is needed for the first page. 20 seconds is needed before processing each 
	additional page in order to stay under the API limit of 200 calls per minute. */
	var wait = 1;
	if(page > 1){
		wait = 20;
	}

	//Execute only after waiting the given amount of time (wait value in seconds).
	setTimeout(function holdUp(){

		//Get the results for a specific page
		helpscout.getPages(startDate, endDate, page, function pageResults(result){
			var countStart = 50*page-49;
			var countEnd = 50*page;

			//For the last page, update the result count to the total rather than the multiple of 50
			if(countEnd > result.count) {
				countEnd = result.count
			}
			console.log('page ', page, ' of ', result.pages, '. Ticket ', countStart, '-', countEnd, ' of', result.count, '...');

			//Loop through results and get the thread for each conversation.
			result.items.forEach(function resultLoop(item){

				//Get the full thread object for the conversation and insert into the OS Ticket DB
				helpscout.getThread(item.id, function threadLoop(thread){
					//filewriter.writeThreadsToFile(thread);  // use to view results in a text file.
					helpscout.insertTickets(thread);

				});
			});

			//Increase the page count and re-enter the loop.
			if(page < result.pages){
				page++;
				loop();
			};
		});
	}, wait*1000);
}());


