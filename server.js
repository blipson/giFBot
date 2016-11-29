var login = require("facebook-chat-api");
var http = require('http');
var fs = require('fs');
var download = require('download-file')

login({email: "gifbotapi@gmail.com", password: "imnottellingyouthis"}, function callback (err, api) {
    if(err) return console.error(err);
 
    api.setOptions({listenEvents: true});
 
    var stopListening = api.listen(function(err, event) {
        if(err) return console.error(err);
 
        switch(event.type) {
          case "message":
            let parsedData = 'IMAGE NOT FOUND OR SOMETHING';
            if(event.body.split(' ')[0] && event.body.split(' ')[0] === 'GIF') {
              console.log('GETTING GIF FOR: ', event.body.split(' ')[1]);

              http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + event.body.split(' ')[1], function(res) {
                const statusCode = res.statusCode;
                const contentType = res.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                  error = new Error(`Request Failed.\n` +
                                    `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                  error = new Error(`Invalid content-type.\n` +
                                    `Expected application/json but received ${contentType}`);
                }
                if (error) {
                  console.log(error.message);
                  // consume response data to free up memory
                  res.resume();
                  return;
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                  try {
                    parsedData = JSON.parse(rawData);
                    console.log(parsedData.data.url.toString());
                    const fn = event.body.split(' ')[1] + '.gif';
                    
                    var options = {
                      directory: '.',
                      filename: fn
                    };

                    download(parsedData.data.image_url.toString(), options, function(err){
                      if (err) throw err
                      console.log("file downloaded");
                      var msg = {
                        body: "GIF for " + event.body.split(' ')[1] + ":",
                        attachment: fs.createReadStream(fn)
                      };

                      api.sendMessage(msg, event.threadID);

                      fs.unlink(fn, function (err) {
                        if (err) console.log(err);
                        console.log('no error on delete');
                      });
                    });
                  } catch (e) {
                    console.log(e.message);
                  }
                });
              }).on('error', (e) => {
                console.log(`Got error: ${e.message}`);
              });

              api.markAsRead(event.threadID, function(err) {
                if(err) console.log(err);
              });
            } else if (event.body.split(' ')[0] === 'GIF') {
              api.sendMessage(parsedData, event.threadID);
            }
            break;
          case "event":
            console.log(event);
            break;
        }
    });
});
