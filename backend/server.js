const express = require('express');

const cors = require('cors');

// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');

// const errorHandler = require('./middleware/error');

//Route Files
const login = require('./routes/routes');

// const { protect } = require('./middleware/auth.middleware');

// load env vars
// dotenv.config();

const app = express();

const corsOptions = {
    methods: 'GET,POST,PATCH,DELETE,PUT',
    origin: 'http://localhost:4205',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

//body parser
// app.use(express.json({limit: '50mb'}));
// app.use(express.bodyParser({limit: '50mb'}));

app.use(express.json({ limit: '50mb' }));
app.use(
    express.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 })
);

// Mount routers
app.use('/login', login);



const PORT = 5000;
const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} on port 5000`)
);



// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err}`);
    //Close server & exit process
    server.close(() => process.exit(1));
});