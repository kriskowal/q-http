
/**
 * A promise-based Q-JSGI server and client API.
 * @module
 */

/*whatsupdoc*/

var HTTP = require("http"); // node
var URL = require("url"); // node
var Q = require("q-util");
var IO = require("q-io");

/**
 * @param {respond(request Request)} respond a JSGI responder function that
 * receives a Request object as its argument.  The JSGI responder promises to
 * return an object of the form `{status, headers, body}`.  The status and
 * headers must be fully resolved, but the body may be a promise for an object
 * with a `forEach(write(chunk String))` method, albeit an array of strings.
 * The `forEach` method may promise to resolve when all chunks have been
 * written.
 * @returns a Node Server object.
 */
exports.Server = function (respond) {
    var self = Object.create(exports.Server.prototype);

    var server = HTTP.createServer(function (_request, _response) {
        var request = exports.Request(_request);

        var closed = Q.defer();
        _request.connection.on("close", function (error, value) {
            if (error)
                closed.reject(error);
            else
                closed.resolve(value);
        });

        Q.when(respond(request), function (response) {
            _response.writeHead(response.status, response.headers);

            if (response.onClose)
                Q.when(closed, response.onClose);

            return Q.when(response.body, function (body) {
                if (
                    Array.isArray(body) &&
                    body.length === 1 &&
                    typeof body[0] === "string"
                ) {
                    _response.end(body[0]);
                } else if (body) {
                    var end = Q.forEach(body, function (chunk) {
                        _response.write(chunk, "binary");
                    });
                    return Q.when(end, function () {
                        _response.end();
                    });
                } else {
                    _response.end();
                }
            });
        });
    });

    var stopped = Q.defer();
    server.on("close", function (err) {
        if (err) {
            stopped.reject(err);
        } else {
            stopped.resolve();
        }
    });

    /***
     * Stops the server.
     * @returns {Promise * Undefined} a promise that will
     * resolve when the server is stopped.
     */
    self.stop = function () {
        server.close();
        listening = undefined;
        return stopped.promise;
    };

    var listening = Q.defer();
    server.on("listening", function (err) {
        if (err) {
            listening.reject(err);
        } else {
            listening.resolve();
        }
    });
    /***
     * Starts the server, listening on the given port
     * @param {Number} port
     * @returns {Promise * Undefined} a promise that will
     * resolve when the server is ready to receive
     * connections
     */
    self.listen = function (port) {
        if (!listening)
            throw new Error("A server cannot be restarted or " +
            "started on a new port");
        server.listen(port >>> 0);
        return listening.promise;
    };

    self.nodeServer = server;

    return self;
};

/**
 * A wrapper for a Node HTTP Request, as received by
 * the Q HTTP Server, suitable for use by the Q HTTP Client.
 */
exports.Request = function (_request) {
    var request = Object.create(exports.Request.prototype);
    /*** {Array} HTTP version. (JSGI) */
    request.version = _request.httpVersion.split(".").map(Math.floor);
    /*** {String} HTTP method, e.g., `"GET"` (JSGI) */
    request.method = _request.method;
    /*** {String} path, starting with `"/"` */
    request.path = _request.url;
    /*** {String} pathInfo, starting with `"/"`, the 
     * portion of the path that has not yet
     * been routed (JSGI) */
    request.pathInfo = _request.url;
    /*** {String} scriptName, the portion of the path that
     * has already been routed (JSGI) */
    request.scriptName = "";
    /*** {String} (JSGI) */
    request.scheme = "http";

    var hostPort = _request.headers.host.split(":");
    /*** {String} */
    request.host = hostPort[0];
    /*** {Number} */
    request.port = +hostPort[1] || 80;

    var socket = _request.socket;
    /*** {String} */
    request.remoteHost = socket.remoteAddress;
    /*** {Number} */
    request.remotePort = socket.remotePort;

    /*** {String} url */
    request.url = request.scheme + "://" + _request.headers.host + request.path;
    /*** A Q IO asynchronous text reader */
    request.body = IO.Reader(_request);
    /*** {Object} HTTP headers (JSGI)*/
    request.headers = _request.headers;
    /*** The underlying Node request */
    request.nodeRequest = _request;
    /*** The underlying Node TCP connection */
    request.nodeConnection = _request.connection;

    return request;
};

/**
 * Creates an HTTP client for issuing requests to
 * the given host on the given port.
 * @param {Number} port
 * @param {String} host
 */
exports.Client = function (port, host) {
    var self = Object.create(exports.Client.prototype);

    var _client = HTTP.createClient(port, host);

    /***
     * Issues an HTTP request.  The request may be
     * any object that has `method`, `path`, `headers`
     * and `body` properties.
     *
     * * `method` `String` is optional, defaults to `"GET"`.
     * * `path` `String` is optional, defaults to `"/"`.
     * * `headers` `Object` is optional, defaults to `{}`.
     * * `body` is optional, defaults to `[]`.  Body must
     *   be an object with a `forEach` method that accepts a
     *   `write` callback.  `forEach` may return a promise,
     *   and may send promises to `write`.  `body` may be a
     *   promise.
     *
     * The Q HTTP `Server` responder receives a `Request`
     * object that is suitable for `request`, and `request`
     * returns a `Response` suitable for returning to the
     * `Server`.
     *
     * @param {{method, path, headers, body}}
     * @returns {Promise * Response}
     */
    self.request = function (request) {
        // host, port, method, path, headers, body
        var deferred = Q.defer();
        var _request = _client.request(
            request.method || 'GET',
            request.path || '/',
            request.headers || {}
        );
        _request.on('response', function (_response) {
            var response = exports.Response(_response);
            deferred.resolve(response);
        });
        _request.on("error", function (error) {
            deferred.reject(error);
        });
        Q.when(request.body, function (body) {
            var end;
            if (body) {
                end = Q.forEach(body, function (chunk) {
                    _request.write(chunk, request.charset);
                });
            }
            Q.when(end, function () {
                _request.end();
            });
        });
        return deferred.promise;
    };

    return self;
};

/**
 * Issues an HTTP request.
 *
 * @param {Request {host, port, method, path, headers,
 * body}} request (may be a promise)
 * @returns {Promise * Response} promise for a response
 */
exports.request = function (request) {
    return Q.when(request, function (request) {
        var client = exports.Client(request.port || 80, request.host);
        return client.request(request);
    });
};

/**
 * Issues a GET request to the given URL and returns
 * a promise for a `String` containing the entirety
 * of the response.
 *
 * @param {String} url
 * @returns {Promise * String} or a rejection if the
 * status code is not exactly 200.  The reason for the
 * rejection is the full response object.
 */
exports.read = function (url) {
    url = URL.parse(url);
    return Q.when(exports.request({
        "host": url.hostname,
        "port": url.port,
        "method": "GET",
        "path": (url.pathname || "") + (url.search || ""),
        "headers": {}
    }), function (response) {
        if (response.status !== 200)
            return Q.reject(response);
        return Q.when(response.body, function (body) {
            return body.read();
        });
    });
};


/**
 * A wrapper for the Node HTTP Response as provided
 * by the Q HTTP Client API, suitable for use by the
 * Q HTTP Server API.
 */
exports.Response = function (_response) {
    var response = Object.create(exports.Response.prototype);
    /*** {Number} HTTP status code */
    response.status = _response.statusCode;
    /*** HTTP version */
    response.version = _response.httpVersion;
    /*** {Object} HTTP headers */
    response.headers = _response.headers;
    /***
     * A Q IO asynchronous text reader.
     */
    response.body = IO.Reader(_response);
    return response;
};

