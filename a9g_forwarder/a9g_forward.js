const querystring = require('querystring');
const https = require('https');
const http = require('http')

const port = 5000
const ha_server = ""
const webhook_path = ""

const server = http.createServer(function(request, response) {
  if (request.method == 'POST') {
    var body = ''
    request.on('data', function(data) {
      body += data
    })
    request.on('end', function() {
      console.log('Received data: ' + body)

      response.removeHeader('Date')
      response.removeHeader('Connection')
      response.removeHeader('Content-Length')
      response.removeHeader('Transfer-Encoding')

      response.end()
      sendToHA(body)
    })
  } 
})

server.listen(port)
console.log("Listening on port: " + port)

function sendToHA(data)
{
  var parsedData = querystring.parse(data)
  var postData = querystring.stringify({
      'device' : parsedData.id,
      'latitude' : parsedData.lat,
      'longitude' : parsedData.lon,
      'speed' : '0.000000',
      'altitude' : '0.000000',
      'accuracy' : '0.0',
      'battery' : parsedData.batt
  });

  var options = {
    hostname: ha_server,
    port: 443,
    path: webhook_path,
    method: 'POST',
    headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': postData.length
       }
  };
  
  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
  
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  
  req.on('error', (e) => {
    console.error(e);
  });
  
  req.write(postData);
  req.end();
}
