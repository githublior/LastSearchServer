const express = require('express');
const app = express();
const port = 8080; 

//GET/hello
app.get('/hello', (req, res) => {
  res.status(200).json({});
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
