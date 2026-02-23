const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const MongoStore = require('connect-mongo');
const path = require('path');
const bodyParser = require('body-parser');
const promisify = require('es6-promisify');

const userApiRouter = require('./routes/userApi');
const authApiRouter = require('./routes/authApi');
const publicSpaceApiRouter = require('./routes/publicSpaceApi');
const accessFeatureApiRouter = require('./routes/accessFeatureApi');
const reviewApiRouter = require('./routes/reviewApi');

const errorHandlers = require('./handlers/errorHandlers');

const { isValidToken } = require('./controllers/authController');

require('dotenv').config({ path: '.variables.env' });

const app = express();

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
  }),
);

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// Here our API Routes
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PATCH,PUT,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header(
    'Access-Control-Allow-Headers',
    'Accept, Authorization,x-auth-token, Content-Type, X-Requested-With, Range',
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.use('/api', authApiRouter);
app.use('/api/user', isValidToken, userApiRouter);
app.use('/api/public-space', publicSpaceApiRouter);
app.use('/api/access-features', accessFeatureApiRouter);
app.use('/api/review', reviewApiRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// If that above routes didn't work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a terrible error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
