var express = require('express'),
    cors = require('cors'),
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    request = require('request'),
    crypto = require('crypto'),
    colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2));

var sessionToken,
    accessToken;

if (argv.user_id != undefined || argv.U != undefined) {
    var user_id = argv.user_id || argv.U;
} else {
    var enterprise_id = argv.enterprise_id || argv.E;
}

if ((argv.api_key || argv.K) && (user_id || enterprise_id) && (argv.passphrase || argv.P) && (argv.client_secret || argv.S)) {

    var box_sub_type;

    if (user_id != undefined) {
        box_sub_type = "user";
    } else {
        box_sub_type = "enterprise";
    }

    var api_key = argv.api_key || argv.K,
        ent_or_user_id = user_id || enterprise_id,
        passphrase = argv.passphrase || argv.P,
        client_secret = argv.client_secret || argv.S;

    var privateKey = fs.readFileSync('private_key.pem');
    var publicKey = fs.readFileSync('public_key.pem');

    var accessToken = generateToken(api_key, ent_or_user_id, box_sub_type, passphrase, client_secret);
    console.info('Access token is only good for 60 mins');

} else if (argv.H || argv.help) {
    console.log(' ');
    console.log('This tool uses Box JWTs to ' + 'create access tokens for App Auth.');
    console.log(' ')
    console.log('These are the following options.'.underline);
    console.log('-K or --api_key'.blue + ' : API key for Box Platform');
    console.log('-E or --enterprise_id'.blue + ' : ID of the enterprise');
    console.log('-U or --user_id'.blue + ' : ID of the App User');
    console.log('-P or --passphrase'.blue + ' : secret for the JWT signing. Must match PEM');
    console.log('-S or --client_secret'.blue + ': found in the developer console');
    console.log(' ');
    console.log('If this is the first time using this tool make sure to have the right setup. Please go to the following site to read docs:');
    console.log('https://github.com/cghil/cmd-line-app-users/blob/master/readme.md'.rainbow);
    console.log(' ')
} else {
    console.log(' ');
    console.log('Unable to generate token. '.red + 'Please check arguements.')
    console.log('Use --help or -H for instructions');
    console.log(' ');
}

// jwt_secret will be the passphrase from above
function generateToken(API_token, ent_or_user_id, box_sub_type, jwt_secret, client_secret) {
    var API_token = API_token,
        ent_or_user_id = ent_or_user_id,
        jwt_secret = jwt_secret,
        client_secret = client_secret
    box_sub_type = box_sub_type;

    ent_or_user_id = ent_or_user_id.toString();
    var expiringTime = generateExpiringTime();

    var sessionToken = crypto.randomBytes(20).toString('hex');

    var signed_token = jwt.sign({
        iss: API_token,
        sub: ent_or_user_id,
        box_sub_type: box_sub_type,
        aud: "https://api.box.com/oauth2/token",
        jti: sessionToken,
        exp: expiringTime
    }, { key: privateKey, passphrase: jwt_secret }, { algorithm: 'RS256', noTimestamp: true });
    console.log("------------------------");
    console.log('The JWT is the following:');
    console.log(colors.blue(signed_token));
    console.log("------------------------");
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

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        var body = JSON.parse(body);
        var accessToken = body.access_token;
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
    return expiringTime;
};