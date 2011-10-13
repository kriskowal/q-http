
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
        "content-type": "text/plain; charset=utf-8"
    },
    "body": {
        "forEach": function (write) {
            var deferred = Q.defer();
            write("Hello, World!");
            setTimeout(function () {
                deferred.resolve();
            }, 1000);
            return deferred.promise;
        }
    }
};

var server = HTTP.Server(function () {
    return response;
});

Q.when(server.listen(8080), function () {
    return Q.when(HTTP.request(request), function (response) {
        return Q.when(response.body, function (body) {
            var done = body.forEach(function (chunk) {
                console.log(chunk.toString("utf-8"));
            });
            Q.when(done, server.stop);
        });
    });
})
.end();

