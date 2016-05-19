var express = require('express'),
    cors = require('cors'),
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    request = require('request'),
	crypto = require('crypto'),
    colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2));

// console.dir(argv);
// console.log(argv.API);

var sessionToken,
    accessToken;

if ((argv.api_key || argv.K) && (argv.enterprise_id || argv.E) && (argv.passphrase || argv.P) && (argv.client_secret || argv.S)) {
	
	var api_key = argv.api_key || argv.K,
		enterprise_id = argv.enterprise_id || argv.E,
		passphrase = argv.passphrase || argv.P,
		client_secret = argv.client_secret || argv.S;

    var privateKey = fs.readFileSync('private_key.pem');
    var publicKey = fs.readFileSync('public_key.pem');

    var accessToken = generateToken(api_key, enterprise_id, passphrase, client_secret);
    console.info('Access token is only good for 60 mins');

} else if (argv.H || argv.help) {
	console.log(' ');
	console.log('This tool uses Box JWTs to ' + 'create access tokens for App Auth.');
	console.log(' ')
	console.log('These are the following options.'.underline);
	console.log('--api_key'.blue + ' : API key for Box Platform');
	console.log('--enterprise_id'.blue + ' : ID of the enterprise');
	console.log('--passphrase'.blue + ' : secret for the JWT signing. Must match PEM');
	console.log('--client_secret'.blue + ': found in the developer console');
} else {
    console.log(' ');
    console.log('Unable to generate token. '.red + 'Please check arguements.') 
    console.log('Use --help or -H for instructions');
    console.log(' ');
}

// jwt_secret will be the passphrase from above
function generateToken(API_token, ent_id, jwt_secret, client_secret) {
     var API_token = API_token,
     	ent_id = ent_id,
     	jwt_secret = jwt_secret,
     	client_secret = client_secret;

    ent_id = ent_id.toString();
    var expiringTime = generateExpiringTime();

    var sessionToken = crypto.randomBytes(20).toString('hex');

    var signed_token = jwt.sign({
        iss: API_token,
        sub: ent_id,
        box_sub_type: "enterprise",
        aud: "https://api.box.com/oauth2/token",
        jti: sessionToken,
        exp: expiringTime
    }, { key: privateKey, passphrase: jwt_secret }, { algorithm: 'RS256', noTimestamp: true });

    var boxResponse = requestForAccesToken(signed_token, client_secret, API_token);
};

function requestForAccesToken(signed_token, client_secret, API_token) {
    var options = {
        method: 'POST',
        url: 'https://api.box.com/oauth2/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            client_id: API_token,
            client_secret: client_secret,
            assertion: signed_token
        }
    };

	request(options, function(error, response, body){
    	if (error) throw new Error(error);
    	var body = JSON.parse(body);
    	var accessToken = body.access_token;
        console.log(body)
    	console.log(' ');
    	console.log(colors.red('Access Token : %s'), accessToken);
    	console.log(' ');
    });

};

function generateExpiringTime() {
    var currentDate = new Date();
    currentDate = currentDate.getTime();
    currentDate = Math.floor((currentDate + 59000) / 1000);
    var expiringTime = currentDate;
    expiringTime = parseInt(expiringTime);
    console.log(new Date(expiringTime * 1000))
    return expiringTime;
};