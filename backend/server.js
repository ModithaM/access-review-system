const mongoose = require('mongoose');

// Make sure we are running node 10.0+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 10 || (major === 10 && minor <= 0)) {
  console.log('Please go to nodejs.org and download version 10 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.variables.env' });

const requiredEnvVars = ['DATABASE', 'JWT_SECRET', 'SECRET', 'KEY'];
const missingEnvVars = requiredEnvVars.filter((envKey) => !process.env[envKey]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
      'Please create/update .variables.env (you can use sample.variables.env as a template).',
  );
  process.exit(1);
}

// Connect to our Database and handle any bad connections
// mongoose.connect(process.env.DATABASE);

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🚫 Error → : ${err.message}`);
});

const glob = require('glob');
const path = require('path');

glob.sync('./models/*.js').forEach(function (file) {
  require(path.resolve(file));
});

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 80);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
