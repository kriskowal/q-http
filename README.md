
Provides a Q promise API for HTTP requests and responses.  This should
resemble JSGI and its hypothetical inverse, but I haven't pored
through the specification to ensure this.

The API
-------

-   ``Server(app)``
    -   accepts an application, returns a server.
    -   calls the application function when requests are received.
        -   if the application returns a response object, sends that
            response.
    -   ``listen(port)``
        -   accepts a port number.
        -   returns a promise for undefined when the server has begun
            listening.
    -   ``stop()``
        -   returns a promise for undefined when the server has stopped.
-   ``request(request)``
    -   accepts a request or a URL string.
    -   returns a promise for a response.
-   ``read(request)``
    -   accepts a request or a URL string.
    -   returns a promise for the response body as a string provided
        that the request is successful with a 200 status.
        -   rejects the promise with the response as the reason for
            failure if the request fails.
-   ``normalizeRequest(request)``
    -   coerces URLs into request objects.
-   ``normalizeResponse(response)
    -   coerces strings, arrays, and other objects supporting
        ``forEach`` into proper response objects.
    -   passes ``undefined`` through as a signal that a request
        will not receive a response directly.
-   request
    -   ``url`` the full URL of the request as a string
    -   ``path`` the full path as a string
    -   ``scriptName`` the routed portion of the path, like ``""`` for
        ``http://example.com/`` if no routing has occurred.
    -   ``pathInfo`` the part of the path that remains to be routed,
        like ``/`` for ``http://example.com`` or ``http://example.com/``
        if no routing has occurred.
    -   ``version`` the requested HTTP version as an array of strings.
    -   ``method`` like ``"GET"``
    -   ``scheme`` like ``"http:"``
    -   ``host`` like ``"example.com"``
    -   ``port`` the port number, like ``80``
    -   ``remoteHost``
    -   ``remotePort``
    -   ``headers``
        corresponding values, possibly an array for multiple headers
        of the same name.
    -   ``body``
    -   ``node`` the wrapped Node request object
-   response
    -   ``status`` the HTTP status code as a number, like ``200``.
    -   ``headers``
    -   ``body``
    -   ``onclose`` is an optional function that this library will call
        when a response concludes.
    -   ``node`` the wrapped Node response object.
-   headers are an object mapping lower-case header-names to
    corresponding values, possibly an array for multiple headers of the
    same name, for both requests and responses.
-   body is a representation of a readable stream, either for the
    content of a request or a response.
    -   ``forEach(callback)``
        -   accepts a ``callback(chunk)`` function
            -   accepts a chunk as either a string or a ``Buffer``
            -   returns undefined or a promise for undefined when the
                chunk has been flushed.
        -   returns undefined or a promise for undefined when the stream
            is finished writing.
        -   the ``forEach`` function for arrays of strings or buffers is
            sufficient for user-provided bodies
    -   the ``forEach`` function is the only necessary function for
        bodies provided to this library.
    -   in addition to ``forEach``, bodies provided by this library
        support the entire readable stream interface provided by
        ``q-io``.
    -   ``read()``
        -   returns a promise for the entire body as a string or a
            buffer.
-   application
    -   accepts a request
    -   accepts Node's responder object as a second argument.
    -   returns a response, a promise for a response, or nothing if no
        response should be sent.

# Copyright

Copyright 2009, 2010, 2011 Kristopher Michael Kowal
MIT License (enclosed)

