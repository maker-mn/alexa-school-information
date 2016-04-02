// If you setup basic auth, change the username
// and password here.  Otherwise, just leave this alone and it will work without auth.
//var auth = new Buffer("nativity_access" + ":" + "dEikd!#ekd_0L.?DS").toString("base64");

var options = {
  appid: "amzn1.echo-sdk-ams.app.32b7d8c7-e8ae-4a1c-927e-ce18e14e9b6b",
  host: "www.mysparetime.org",
  port: "80",
  headers: {
//      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
  },
  useHttps: false, // Change to true if you setup node-sonos-http-api with HTTPS
  rejectUnauthorized: true, // Change to false if you self-signed your certificate
};

module.exports = options;

