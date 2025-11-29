require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');

const port = config.PORT || 3000;

app.listen(port, () => {
  console.log(`Pravah backend running on http://localhost:${port} (env=${config.NODE_ENV})`);
});
