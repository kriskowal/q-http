<!-- vim:ts=4:sts=4:sw=4:et:tw=60 -->

# 0.1.14

-   Support UNIX socket listen form #3

# 0.1.13

-   Fix a mistake in handling body length (Sergey Belov)

# 0.1.11

-   Fixed a problem with lost errors in JSGI applications.
-   Fixed a problem with query strings in pathInfo.

# 0.1.10

-   Fixed a bug in the automatically generated host header.

# 0.1.9

-   Added ``normalizeRequest`` and ``normalizeResponse``.

# 0.1.8

-   Synchronized dependencies to fix thenable assimilation
    bug in Q.
-   Updated basic test to verify that the response body is a
    fulfilled value, not a promise for the body stream.

# 0.1.7

-   Synchronized dependencies to fix IO stream .close() bug.

# 0.1.6

-   Synchronized dependencies

# 0.1.5

-   Added a response qualifier argument to ``read`` so that
    you can elect to accept responses with alternate status
    codes or restrict based on other criteria.

# 0.1.4

-   Changed request.body in ServerRequest from a promise to
    fulfilled IO Reader with read and forEach.

# 0.1.3

-   Synchronized with latest versions of dependencies.
-   Response body is no longer promised; response doesn't
    get fulfilled until the body stream is available.

# 0.1.2

-   Forwarding wrapped response object in addition to
    request to HTTP request responder "applications".
-   Extended the ``read`` and ``request`` APIs such that URL
    strings can be provided for either, or request objects
    with URL strings to populate all missing properties.
-   Renamed (temporary alias) ``onClose`` ``onclose``
-   Fixed memory leak of closed connection listeners.
-   Separated ``{Client,Server}{Request,Response}``
-   Added uniform .node properties to all wrappers.
-   Deprecated all .node* properties.

# 0.1.0

-   added SSL support to HTTP requests
-   removed the Client API, in accordance with Node

# 0.0.6

-   added "host" header implicitly to request.read [#1
    asutherland]

# 0.0.5

-   added "stopped" promise to servers

# 0.0.4

-   fixed a flaw in the HTTP request where a refused
    connection threw an exception instead of rejecting all
    subsequent requests with the error as the reason.

# 0.0.3

-   fixed a flaw in the HTTP request wrapper wherein it is
    assumed that a Host header was sent by the client.

# 0.0.2

-   added pathInfo, scriptName, scheme, host, and port to
    Request objects to approach JSGI 0.3 compliance.
-   added remoteHost, remotePort, and url to Request objects
-   added request.nodeRequest and request.nodeConnection
-   removed request.connection. use
    request.nodeRequest.connection or
    request.nodeConnection.
-   added server.nodeServer link for low-level extension

# 0.0.1

-   synced dependencies

