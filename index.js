const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('RANA-X-MD Bot Running! ✅ Clean & Ready');
});

app.listen(PORT, () => {
  console.log('RANA-X-MD Running on port ' + PORT);
});

require('./main');
