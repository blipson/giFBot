const login  = require('facebook-chat-api'),
    http     = require('http'),
    fs       = require('fs'),
    download = require('download-file');

generateRandomEmotion = () => {
    const emotions = ['scared', 'angry', 'sad', 'happy', 'disgusted', 'surprised'];
    return emotions[Math.floor(Math.random() * emotions.length)];
}

login({ email: 'gifbotapi@gmail.com', password: 'shhhhhhh' }, (err, api) => {
    if (err) {
        return console.error(err);
    }

    api.setOptions({ listenEvents: true });

    api.listen((err, event) => {
        if (err) {
            return console.error(err);
        }

        let parsedData = {};
        if (event.body) {
            let search = event.body.split(' ');
            if (search[0].toLowerCase() === 'gif') {
                search.shift();
                const gifbotResponse = search.join(' ');
                search = search.join('+');

                if (search.includes('/') || search.includes('\\')) {
                    api.sendMessage('That was very naughty what you did there', event.threadID);
                    return;
                }

                console.log('Retrieving gif for: ', gifbotResponse);

                http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&rating=r&tag=' + search, (res) => {
                    const statusCode = res.statusCode,
                        contentType = res.headers['content-type'];
                    let error;
                    if (statusCode !== 200) {
                        api.sendMessage('I didnt find anything, try searching better idiot', event.threadID);
                        error = new Error(`Request Failed.\n` +
                                          `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error(`Invalid content-type.\n` +
                                          `Expected application/json but received ${contentType}`);
                    }

                    if (error) {
                        console.log(error.message);
                        res.resume();
                        return;
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => {
                        rawData += chunk;
                    });

                    res.on('end', () => {
                        try {
                            parsedData = JSON.parse(rawData);
                            if (!parsedData.data.image_url) {
                                api.sendMessage('I didnt find anything, try searching better idiot', event.threadID);
                                return;
                            }
                            console.log('it has ', parsedData.data.image_frames, 'frames');
                            const fn = event.body.split(' ')[1] + '.gif';
                            const options = {
                                directory: '.',
                                filename:  fn
                            };
                            console.log(parsedData);
                            if (parsedData.data.image_frames < 100) {
                                download(parsedData.data.image_url, options, (err) => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }

                                    console.log('file downloaded');
                                    const msg = {
                                        body:       'GIF for ' + gifbotResponse + ':',
                                        attachment: fs.createReadStream(fn)
                                    };

                                    api.sendMessage(msg, event.threadID);

                                    fs.unlink(fn, (err) => {
                                        if (err) {
                                            console.log(err);
                                            return;
                                        }

                                        console.log('file deleted from local machine');
                                    });
                                });
                            } else {
                                download(parsedData.data.fixed_width_small_url.toString(), options, (err) => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    console.log('file downloaded');
                                    const msg = {
                                        body:       'GIF for ' + gifbotResponse + ':',
                                        attachment: fs.createReadStream(fn)
                                    };

                                    api.sendMessage(msg, event.threadID);

                                    fs.unlink(fn, (err) => {
                                        if (err) {
                                            console.log(err);
                                            return;
                                        }
                                        console.log('file deleted from local machine');
                                    });
                                });
                            }

                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                }).on('error', (e) => {
                    console.log(`Got error: ${e.message}`);
                });

                api.markAsRead(event.threadID, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            } else if (search[0].toLowerCase() === 'mrw') {
                search.shift();
                const gifbotResponse = search.join(' ')
                    .split('I ')
                    .join('you ')
                    .split('i ')
                    .join('you ')
                    .split("I'm ")
                    .join("you're ")
                    .split("i'm ")
                    .join("you're ")
                    .split('my ')
                    .join('your ')
                    .split('myself ')
                    .join('yourself ');
                console.log('Retrieving gif for: ', gifbotResponse);
//                unless they passed in one of them
                const emo = generateRandomEmotion();
                console.log(emo);
                search = search.slice(0, 3).join('+')
                http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&rating=r&tag=' + emo, (res) => {
                    const statusCode = res.statusCode,
                        contentType = res.headers['content-type'];
                    let error;
                    if (statusCode !== 200) {
                        api.sendMessage('I didnt find anything, try searching better idiot', event.threadID);
                        error = new Error(`Request Failed.\n` +
                                          `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error(`Invalid content-type.\n` +
                                          `Expected application/json but received ${contentType}`);
                    }

                    if (error) {
                        console.log(error.message);
                        res.resume();
                        return;
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => {
                        rawData += chunk;
                    });

                    res.on('end', () => {
                        try {
                            parsedData = JSON.parse(rawData);
                            if (!parsedData.data.image_url) {
                                api.sendMessage('I didnt find anything, try searching better idiot', event.threadID);
                                return;
                            }
                            console.log('it has ', parsedData.data.image_frames, 'frames');
                            const fn = event.body.split(' ')[1] + '.gif';
                            const options = {
                                directory: '.',
                                filename:  fn
                            };

                            if (parsedData.data.image_frames < 200) {
                                download(parsedData.data.image_url, options, (err) => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }

                                    console.log('file downloaded');
                                    const msg = {
                                        body:       'YRW ' + gifbotResponse + ':',
                                        attachment: fs.createReadStream(fn)
                                    };

                                    api.sendMessage(msg, event.threadID);

                                    fs.unlink(fn, (err) => {
                                        if (err) {
                                            console.log(err);
                                            return;
                                        }
                                        console.log('file deleted from local machine');
                                    });
                                });
                            }

                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                }).on('error', (e) => {
                    console.log(`Got error: ${e.message}`);
                });

                api.markAsRead(event.threadID, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    });
});
