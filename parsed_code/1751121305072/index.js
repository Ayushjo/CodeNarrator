const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);

app.listen(3000, () => console.log('Server started on port 3000'));