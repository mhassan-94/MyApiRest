// IMPORT //
var express = require ('express');
var bodyParser = require ('body-parser');
var apiRouter = require ('./apiRouter').router;



// SERVER //
var server = express();

// BODY-PARSER CONFIG //
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// ROUTES //
server.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send('<h1>Bonjour server</h1>')
})

server.use('/api/', apiRouter);

// LANCEMENT SERVER //
server.listen(9900, () => {
    console.log('server en marche')
});