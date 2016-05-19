#Quick App User Access Tokens
This tool is used from the commandline to make quick access tokens for app users.

##What You Need To Have Installed In Order To Use
* node
* npm
* openssl

##Steps To Set Up
You will need to make the RSA keypair within the folder that this tool has been downloaded too.

Follow the steps listed [here](https://box-content.readme.io/docs/app-auth) to make the RSA keypair.

After generating your RSA keypair, your file structure should look like this below.
```
cmd-line-create-token
	├── node_modules
		└── many other files...
	├── package.json
	├── private_key.pem
	├── public_key.pem
	├── readme.md
	└── server.js
```
Remember to know your private key password. This password will need to be passed within the cmd-line to run the tool properly.

## Steps to Run
This tool uses ARGV to run. If you want help on what to pass in, type the -H or --help commands.

To run tool go within the folder and type `node server.js -H`. This will tell you the options you need to run in order to run.

**Here is an example of running this tool.**

`node server.js -K API_KEY -E ENTERPRISE_ID -P PASSWORD_FOR_PRIVATE_KEY -S CLIENT_SECRET`

##Please add to this tool if you want
BTW... **I haven't finished working on it**

Hopefully, we can make it easier to use in the future.