File System Key Value
=====================

A filesystem based key-value store in Node.JS via HTTP

- [Installation](#installation)
- [Features](#features)
- [Example](#example)
- [Methods](#methods)
- [Usage](#usage)
- [Notes](#notes)
- [Inspiration](#inspiration)
- [License](#license)

<a name="installation" />

Installation
------------

First, install [Node.JS](http://nodejs.org/).  Then:

    [sudo] npm install -g fskv

<a name="features" />

Features
--------

- HTTP API for storing, modifying, streaming, and deleting data
- Flat text files used for storage
- HTTP Caching headers (ETag, Last-Modified, If-None-Match)

<a name="example" />

Example
-------

Fire up `fskv` by running:

    $ mkdir data
    $ fskv
    server started on http://localhost:9000
    127.0.0.1 - - [13/Sep/2013:01:54:02 -0400] "PUT /data/fskv-client-test HTTP/1.1" 200 34 "-" "-"
    127.0.0.1 - - [13/Sep/2013:01:54:03 -0400] "PUT /data/fskv-delete-test HTTP/1.1" 200 34 "-" "-"

This will start the HTTP server listening on `localhost` on port 9000,
and serve out of `./data`.

### Basic Example

Now, put some data in the database.

    $ curl -X PUT -d 'dave' -i localhost:9000/data/myname
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Date: Fri, 03 May 2013 01:48:43 GMT
    Connection: keep-alive
    Transfer-Encoding: chunked

    {"message":"saved","status":"ok"}

The server will respond with a 200 if everything was successful, and with
a JSON encoded message.

Now, retrieve the data.

    $ curl -i localhost:9000/data/myname
    HTTP/1.1 200 OK
    Last-Modified: Fri, 03 May 2013 01:48:43 GMT
    Content-Length: 4
    Content-Type: application/octet-stream
    ETag: "4-1367545723000"
    Date: Fri, 03 May 2013 01:49:51 GMT
    Connection: keep-alive

    dave

`ETag` and `Last-Modified` supported for both `HEAD` and `GET` requests.
The body of the response is the value supplied in the `PUT` request above.

Delete the data.

    $ curl -i -X DELETE localhost:9000/data/myname
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Date: Fri, 03 May 2013 01:51:06 GMT
    Connection: keep-alive
    Transfer-Encoding: chunked

    {"message":"deleted","status":"ok"}

Like the `PUT`, a 200 is returned with a JSON encoded message if everything
is successful.

### Advanced

404 is returned for non-existent keys

    $ curl -i localhost:9000/data/myname
    HTTP/1.1 404 Not Found
    Date: Fri, 03 May 2013 01:52:01 GMT
    Connection: keep-alive
    Transfer-Encoding: chunked

You can put data more than once... last write wins

    $ curl -X PUT -d 'hello' localhost:9000/data/myname
    {"message":"saved","status":"ok"}
    $ curl -X PUT -d 'goodbye' localhost:9000/data/myname
    {"message":"saved","status":"ok"}
    $ curl localhost:9000/data/myname
    goodbye

Use `?exclusive` with `PUT`s to error if the key exists.  Use this to avoid
race conditions.

    $ curl -X PUT -d 'first' localhost:9000/data/myname?exclusive
    {"message":"saved","status":"ok"}
    $ curl -X PUT -d 'second' localhost:9000/data/myname?exclusive
    {"error":"EEXIST, open 'myname'","code":"EEXIST"}
    $ curl localhost:9000/data/myname
    first

### Stats and Health

You can hit `/ping` or `/stats` to see process health.

    $ curl localhost:9000/ping
    pong
    $ curl localhost:9000/stats | json
    {
      "system": {
        "arch": "x64",
        "dir": "/Users/dave/dev/fskv/data",
        "fskvversion": "v0.0.5",
        "mem": {
          "rss": 17055744,
          "heapTotal": 10312960,
          "heapUsed": 4666520
        },
        "nodeversion": "v0.10.10",
        "now": 1379090221712,
        "pid": 16906,
        "platform": "darwin",
        "started": 1379090209770
      },
      "http": {
        "requestmethods": {
          "DELETE": 1,
          "HEAD": 1
        },
        "totalrequests": 2
      }
    }

`/stats` contains information both about the running process, and how many
requests have been processed over HTTP.  Note: the stats counters will only
be bumped if a request is made to `/data/*`

<a name="methods" />

Methods
-------

### `GET /data/:key`

Retrieve a key, supports `if-none-match` with the `ETag` given.

### `HEAD /data/:key`

Same as `GET` without the data.

### `PUT /data/:key`

Put data given into the key.

Options

- `?exclusive`: Error if the key already exists, allows for an atomic `PUT`.
If the key exists, the `PUT` will fail with `EEXISTS` and return a 409.

### `DELETE /data/:key`

Delete the key given.

<a name="usage" />

Usage
-----

    Usage: fskv [-b] [-d dir] [-h] [-H host] [-l] [-p port] [-u] [-v]

    A filesystem based key-value store in Node.JS via HTTP

    Options
      -b, --buffer       buffer logging, defaults to false
      -d, --dir <dir>    the database directory, defaults to ./data
      -h, --help         print this message and exit
      -H, --host <host>  the address to bind to, defaults to localhost
      -n, --no-log       disable logging, logging is enabled by default
      -p, --port <port>  the port to bind to, defaults to 9000
      -u, --updates      check npm for available updates
      -v, --version      print the version number and exit

<a name="notes" />

Notes
-----

- This program does no in-memory caching or expiring of data, it's built to run
on the [ZFS](http://en.wikipedia.org/wiki/ZFS) filesystem with the ARC for
caching.
- I don't know if I would use this in production.
- TODO: The `Content-Type` header is not stored, and is determined by key name extension

<a name="inspiration" />

Inspiration
-----------

My tweet about the filesystem being the best nosql database.

<blockquote class="twitter-tweet"><p>my favorite db. writes = echo value &gt;
key.reads = cat key. most languages have built in bindings.</p>&mdash; Dave
Eddy <a
href="https://twitter.com/bahamas10_/status/310096645356404737">March 8,
2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

[greyhound](https://github.com/gen0cide-/greyhound) for using bash+netcat for a
filesystem key-value store

<a name="license" />

License
-------

MIT
