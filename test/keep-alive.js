
var Q = require("q");
var HTTP = require("../q-http");

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

    var done = [1,2,3].reduce(function (done) {
        return Q.when(HTTP.request(request), function (response) {
            return Q.when(response.body, function (body) {
                return Q.when(body.forEach(function (chunk) {
                    console.log(chunk.toString('utf-8'));
                })).wait(done);
            });
        });
    }, undefined);

    return Q.when(done, server.stop);
})
.end();

