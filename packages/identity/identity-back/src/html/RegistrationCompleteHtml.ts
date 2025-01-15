const html = `
                <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registro Completo</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
          font-family: Arial, sans-serif;
        }
        .container {
          width: 300px;
          border: 1px solid grey;
          padding: 20px;
          text-align: center;
          background: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .title {
          color: darkgreen;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .link {
          margin-top: 20px;
          text-decoration: none;
          color: #007bff;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Registro Completo</div>
        <a href="/login" class="link">Login</a>
      </div>
    </body>
    </html>
                `

export default html
