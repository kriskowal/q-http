var Q = require("q");
var HTTP = require("q-http");
Q.when(HTTP.read("http://localhost:1/blah.js"), null, function (error) {
    console.log(error);
});
