var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();
var manager = '';

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Content-Type', 'text/plain');
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS, PATCH');
    next();
});

app.use(bodyParser.json({ type: 'application/*+json' }))
var jsonParser = bodyParser.json()

// support for employees

// loading employees specific to each manager only
app.get('/users', function(req, res) {
    manager = req.query.manager;
    return app.getData(res, './data/' + manager + '.json');
});

app.post('/users', jsonParser, function(req, res){ return app.postData(req, res, './data/' + manager + '.json'); });

app.post('/resources', jsonParser, function(req, res){ return app.postData(req, res, './data/' + manager + '.json'); });


// patch the specific employee in the current file
app.patch('/resources/:id', jsonParser, function(req, res) { return app.patchData(req, res, './data/' + manager + '.json'); });

/*
app.get('/resources', function(req, res) { return app.getData(res, './data/resources.json'); });
app.get('/resources/:id', function(req, res) { return app.getDataID(req, res, './data/resources.json') });
app.post('/resources', jsonParser, function(req, res){ return app.postData(req, res, './data/resources.json'); });
/**/

// support for assignments
app.get('/assignments', function(req, res) { return app.getData(res, './data/assignments.json'); });
app.patch('/assignments/:id', jsonParser, function(req, res) { return app.patchData(req, res, './data/assignments.json'); });
app.post('/assignments', jsonParser, function(req, res){ return app.postData(req, res, './data/assignments.json'); });

// get data from specified JSON file
app.getData = function(res, filePath) {
	fs.readFile(filePath, function (err, data) {
		if (err) {
		   return console.error(err);
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
