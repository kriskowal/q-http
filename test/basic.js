
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

exports['test basic'] = function (ASSERT, done) {

    var server = HTTP.Server(function () {
        return response;
    });

    Q.when(server.listen(8080), function () {
        return Q.when(HTTP.request(request))
        .then(function (response) {
            ASSERT.ok(!Q.isPromise(response.body), "body is not a promise")
            var acc = [];
            return response.body.forEach(function (chunk) {
                acc.push(chunk.toString("utf-8"));
            }).then(function () {
                ASSERT.equal(acc.join(""), "Hello, World!", "body is hello world");
            });
        })
    })
    .fin(server.stop)
    .fin(done)
    .fail(function (reason) {
        ASSERT.ok(false, reason);
    })

}

var deferredResponse = {
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
            }, 100);
            return deferred.promise;
        }
    }
};

exports['test deferred'] = function (ASSERT, done) {

    var server = HTTP.Server(function () {
        return deferredResponse;
    });

    Q.when(server.listen(8080), function () {
        return Q.when(HTTP.request(request))
        .then(function (response) {
            var acc = [];
            return response.body.forEach(function (chunk) {
                acc.push(chunk.toString("utf-8"));
            }).then(function () {
                ASSERT.equal(acc.join(""), "Hello, World!", "body is hello world");
            });
        })
    })
    .fin(server.stop)
    .fin(done)
    .fail(function (reason) {
        ASSERT.ok(false, reason);
    })

}

if (module === require.main) {
    require("test").run(exports);
}

