var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();

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
app.get('/resources', function(req, res) { return app.getData('./data/resources.json', res); });
app.patch('/resources/:id', jsonParser, function(req, res) { return app.patchData(req, res, './data/resources.json'); });
app.post('/resources', jsonParser, function(req, res){ return app.postData(req, res, './data/resources.json'); });

// support for assignments
app.get('/assignments', function(req, res) { return app.getData('./data/assignments.json', res); });
app.patch('/assignments/:id', jsonParser, function(req, res) { return app.patchData(req, res, './data/assignments.json'); });
app.post('/assignments', jsonParser, function(req, res){ return app.postData(req, res, './data/assignments.json'); });

// load specified JSON file to get data
app.getData = function(filePath, res) {
	fs.readFile(filePath, function (err, data) {
		if (err) {
		   return console.error(err);
		}
		return res.json(JSON.parse(data.toString()));
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
                console.log('patch error: ' + error)
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

app.get('/resources/:id', function(req, res) {
	var id = req.params.id;
	fs.readFile('./data/resources.json', 'utf8', function (err, data) {
		if (err) {
		   return console.error(err);
		}
        var employees = JSON.parse(data.toString());
        for(employee in employees.data) {
            if(id == employees.data[employee].id){
                break;
            }
        }
        // TODO:  if employeeID not found
        res.json(employees.data[employee])
	});
});

app.listen(3000, function () { console.log('Example app listening on port 3000!'); })
