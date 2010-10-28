
var SYS = require("sys");
var Q = require("q-util");
var HTTP = require("q-http");

var request = {
    "host": "localhost",
    "port": 8080,
    "headers": {
        "host": "localhost"
    }
};

var response = {
    "status": 200,
    "headers": {
        "content-type": "text/plain"
    },
    "body": [
        "Hello, World!"
    ]
};

var server = HTTP.Server(function () {
    return response;
});

Q.when(server.listen(8080), function () {

    var client = HTTP.Client(8080, "localhost");

    var done = Q.times(3, function () {
        return Q.when(client.request(request), function (response) {
            return Q.when(response.body, function (body) {
                return body.forEach(SYS.puts);
            });
        });
    });

    Q.when(done, server.stop);

}, Q.error);

