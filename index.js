var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();
var manager = ''; // the current file to edit
var directs = ''; // if expanding an employee that has directs of their own
var fileYear = ''; // the year/folder to open files from

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Content-Type', 'text/plain');
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS, PATCH');
    next();
});

app.use(bodyParser.json({ type: 'application/*+json' }))
var jsonParser = bodyParser.json()

// check if file exists
app.get('/file', function(req, res) { res.send(false) });

app.get('/file/:manager', function(req, res) {
	var exists = req.params.manager;

    fs.access(`./data/${fileYear}/${exists}.json`, fs.R_OK | fs.W_OK, (err) => {
        res.send(err ? false : true);
    });
});

app.get('/file/:year/:manager', function(req, res) {
	var exists = req.params.manager;
    var year = req.params.year;
    fs.access(`./data/${year}/${exists}.json`, fs.R_OK | fs.W_OK, (err) => {
        res.send(err ? false : true);
    });
});

// create the specified filename
app.get('/makefile/:year/:filename', function(req, res) {
    var dir = `./data/${req.params.year}`;
    var prevYear = parseInt(req.params.year)-1;
    var filename = `${req.params.filename}.json`;

    fs.existsSync(dir) || fs.mkdirSync(dir);
    fs.open(`${dir}/${filename}`, 'w', (err, fd) => {
        fs.readFile(`./data/${prevYear}/${filename}`, 'utf8', function (err, data) {
            if (err) throw err;
            var post = JSON.parse(data.toString());
            fs.writeFile (`${dir}/${filename}`, JSON.stringify(post, null, 2), function(err) {
                res.send(err ? false : true);
            });
        });
    });
});

app.get('/directs', function(req, res) {
    directs = req.query.manager; // get name of the employee with their own directs
    return app.getData(res, `./data/${fileYear}/${directs}.json`);
});

// loading employees specific to each manager only
app.get('/users', function(req, res) {
    fileYear  = req.query.year;
    manager = req.query.manager;
    return app.getData(res, `./data/${fileYear}/${manager}.json`);
});

app.post('/users', jsonParser, function(req, res){ return app.postData(req, res, `./data/${fileYear}/${manager}.json`); });
app.post('/resources', jsonParser, function(req, res){ return app.postData(req, res, `./data/${fileYear}/${manager}.json`); });
app.patch('/resources/:id', jsonParser, function(req, res) { return app.patchData(req, res, `./data/${fileYear}/${manager}.json`); });

// support for assignments
app.get('/assignments', function(req, res) {
    fileYear = req.query.year;
    return app.getData(res, `./data/${fileYear}/assignments.json`);
});
app.patch('/assignments/:id', jsonParser, function(req, res) { return app.patchData(req, res, `./data/${fileYear}/assignments.json`); });
app.post('/assignments', jsonParser, function(req, res){ return app.postData(req, res, `./data/${fileYear}/assignments.json`); });

// get data from specified JSON file
app.getData = function(res, filePath) {
	fs.readFile(filePath, function (err, data) {
		if (err) {
		   console.error(err);
           return res.json(JSON.parse('{"data":[]}'))
		}
		return res.json(JSON.parse(data.toString()));
	});
};

// get data with specific ID from JSON file
app.getDataID = function(req, res, filePath) {
	var id = req.params.id;
	fs.readFile(filePath, 'utf8', function (err, data) {
		if (err) {
		   return console.error(err);
		}
        var items = JSON.parse(data.toString());
        for(item in items.data) {
            if(id == items.data[item].id){
                break;
            }
        }
        // TODO:  if ID not found
        res.json(items.data[item])
	});
};

// patch data in specified file
app.patchData = function(req, res, filePath) {
	var id = req.params.id;
    if (!req.body) return res.sendStatus(400)

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err){
            throw err;
            res.sendStatus(400)
        }

        var patches = JSON.parse(data.toString());

        for(patch in patches.data) {
            if(id == patches.data[patch].id){
                patches.data[patch] = req.body.data
                break;
            }
        }

        fs.writeFile (filePath, JSON.stringify(patches, null, 2), function(err) {
            if (err){
                throw err;
                res.sendStatus(400)
            }
        });
    });
	res.json(req.body);
};

// new data added, append to end of JSON
app.postData = function(req, res, filePath) {
	var id = req.params.id;
    if (!req.body) return res.sendStatus(400)

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;

        var post = JSON.parse(data.toString());
        post.data.push(req.body.data)

        fs.writeFile (filePath, JSON.stringify(post, null, 2), function(err) {
            if (err) throw err;
        });
    });
	res.json(req.body);
};

app.listen(3000, function () { console.log('Example app listening on port 3000!'); })
