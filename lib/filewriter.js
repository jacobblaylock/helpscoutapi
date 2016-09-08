/**
 * @function writeConversationsToFile
 * Parses an array of conversation objects and builds a blob
 * of text that is appended to the file specified.
 *
 * @param {Object} conversations - A Helpscout object containing an Array of conversation data.
 */
exports.writeConversationsToFile = function writeConversationsToFile(conversations){
	var fs = require('fs');
    var text = '';
    text = text + 'PAGE: ' + conversations.page + ' of ' + conversations.pages +
    	'\n========================\n';
    conversations.items.forEach(function(t){
        //console.log(t);
        text = text +
            'Number:\t\t' + t.number.toString() + '\n';
            '\tStatus:\t\t' + t.status + '\n' +
            '\tCreated At:\t' + t.createdAt.toString() + '\n';
    });

    fs.appendFile('conversations.txt', text, function (err) {
        if (err) return console.log(err);
        console.log('File Written');
    });
}

/**
 * @function writeThreadsToFile
 * Parses a Helpscout thread object for a single conversation and 
 * builds a readable blob of text that is appended to the given file.
 *
 * @param {Object} thread - Helpscout thread object for a specific conversation.
 */
exports.writeThreadsToFile = function writeThreadToFile(thread){
	var fs = require('fs');
	var striptags = require('striptags');
    var text = '';

        text = text + 'Number:\t\t\t' + thread.item.number.toString() + '\n';

        thread.item.customFields.forEach(function(cf){
        	if(cf.name === 'Client'){
        		text = text + 'Client:\t\t\t' + cf.value + '\n';
        	}
        	if(cf.name === 'Billable Hours'){
        		text = text + 'Billable Hours:\t' + cf.value + '\n';
        	}
        }) 

        text = text +
            //'Status:\t\t\t' + thread.item.status + '\n' ;
            'Created At:\t\t' + thread.item.createdAt + '\n' +
            'Closed At:\t\t' + thread.item.closedAt + '\n' +
            'Closed By:\t\t' + thread.item.closedBy.firstName + ' ' + thread.item.closedBy.lastName + '\n' +
            '--------------------------------\n\n'
    		'SUBJECT:  ' + thread.item.subject +
    		'From: ' + thread.item.customer.firstName + ' ' + thread.item.customer.lastName + '\n\n';

            
            thread.item.threads.forEach(function(t){
            	if(t.body !== null){
            		text = text +
                    t.createdAt + '  (' + t.createdBy.firstName + ' ' + t.createdBy.lastName + '):\n\n' +
                    striptags(t.body.replace(/<br>/g, '\n')) + '\n\n';
            	}
 
            });
            text = text + '\n\n======================================================\n\n';      


    fs.appendFile('threads.txt', text, function (err) {
        if (err) return console.log(err);
        //console.log('File Written');
    });
    
}