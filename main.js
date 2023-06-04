
const port = 80;
const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const router = express.Router();


const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require("fs")
const path = require('path');
//const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const http = require('http');
const server = http.createServer(app);
const SpotifyWebApi = require('spotify-web-api-node');
const { Script } = require('vm');
const client_id = '2452ff5abd354d9c95b54de67bb9eb72'; // Your client id
const client_secret = '64537e46115f41719d976e933eafe3d6'; // Your secret
const redirect_uri = 'http://34.64.57.216:80/callback'; // Your redirect uri
const spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

require('dotenv').config();

app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));
app.use(
    express.urlencoded({
        extended: true 
    })
);
app.use(express.json());

app.use(express.static(__dirname + '/public'))


app.set("view engine", "ejs");


var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
	for (var i = 0; i < length; i++) {
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
  };

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-currently-playing user-read-playback-state user-modify-playback-state app-remote-control streaming';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/',async(req,res)=>{
	const access_token =spotifyApi.getAccessToken();
	res.render('index',{access_token});

});

app.post('/toggleplay', async (req, res) => {
  const devices = await spotifyApi.getMyDevices();
  console.log(devices.body.devices.id); //여기서 찍어보고 해당된 아이디 가져오고 아래 코드에 경로 추가하기 
    const id = devices.body.devices.id //추가하기
    await spotifyApi.play({ device_id: id, uris: ['spotify:track:7tajvm3L4vnNsOyMBf3yq3'] });
    console.log('/toggleplay');
	res.redirect('/');
});

app.get('/callback', function(req, res) {

	// your application requests refresh and access tokens
	// after checking the state parameter
	console.log('/callback')
  
	var code = req.query.code || null;

	  var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
		  code: code,
		  redirect_uri: redirect_uri,
		  grant_type: 'authorization_code'
		},
		headers: {
		  'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
		},
		json: true
	  };
  
	  request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
	  //(var > const로 바꿈 바로 아래 코드)
		  const access_token = body.access_token;
		  const refresh_token = body.refresh_token;
	  spotifyApi.setAccessToken(access_token);
	  spotifyApi.setRefreshToken(refresh_token);      
		  var options = {
			url: 'https://api.spotify.com/v1/me',
			headers: { 'Authorization': 'Bearer ' + access_token },
			json: true
		  };
  
		  // use the access token to access the Spotify Web API
		  request.get(options, function(error, response, body) {
			console.log(body);
		  });
	  res.redirect('/');
		  // we can also pass the token to the browser to make requests from there
		  //res.redirect('/#' +
		  //  querystring.stringify({
		  //    access_token: access_token,
		  //    refresh_token: refresh_token
		  //  }));
	   // } else {
	   //   res.redirect('/#' +
	   //     querystring.stringify({
	   //       error: 'invalid_token'
	   //     }));
		}
	  });
	});

server.listen(80,() => {
    console.log(`Server running on port: ${port}`);
})