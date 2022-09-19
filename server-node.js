const http = require('http');

const todos = [
  {
    id: 1,
    text: 'Learn Node.js',
  },
  {
    id: 2,
    text: 'Learn React',
  },
  {
    id: 3,
    text: 'Learn Angular',
  },
];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // console.log(req.method);
  // const { headers, url, method } = req;
  // console.log(headers, url, method);
  // res.setHeader('Content-Type', 'text/plain');
  // res.write('Hello');

  //! HEADERS CAN BE SET LIKE THAT
  // res.statusCode = 404;
  // res.setHeader('Content-Type', 'application/json');
  // res.setHeader('X-Powered-By', 'Node.js');
  //! OR LIKE THAT
  // res.writeHead(200, {
  //   'Content-Type': 'application/json',
  //   'X-Powered-By': 'Node.js',
  // });

  let body = [];
  req
    .on('data', (chunk) => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();

      let status = 404;
      const response = {
        success: false,
        data: null,
        error: null,
      };

      if (method === 'GET' && url === '/todos') {
        status = 200;
        response.success = true;
        response.data = todos;
      } else if (method === 'POST' && url === '/todos') {
        const { id, text } = JSON.parse(body);

        if (!id || !text) {
          status = 400;
          response.error = 'Please add id and text';
        } else {
          todos.push({ id, text });
          status = 201;
          response.success = true;
          response.data = todos;
        }
      }

      res.writeHead(status, {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.js',
      });

      res.end(JSON.stringify(response));
    });

  // res.write('<h1>Hello</h1>');
  // res.write('<h2>Bye</h2>');
  // res.end(
  //   JSON.stringify({
  //     success: true,
  //     data: todos,
  //   })
  // );

  // console.log(req.headers.authorization);

  // res.end(
  //   JSON.stringify({
  //     success: true,
  //     // error: 'Not found',
  //     data: todos,
  //   })
  // );
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
