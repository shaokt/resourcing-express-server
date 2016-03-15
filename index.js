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

app.get('/resources', function (req, res) {
	fs.readFile('./data/resources.json', function (err, data) {
		if (err) {
		   return console.error(err);
		}
		res.json(JSON.parse(data.toString()));
		//console.log("Asynchronous read: " + data.toString());
	});
});

app.get('/assignments', function (req, res) {
	fs.readFile('./data/assignments.json', function (err, data) {
		if (err) {
		   return console.error(err);
		}
		res.json(JSON.parse(data.toString()));
	});
});

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

// new person added, append to end of JSON
app.post('/resources', jsonParser, function (req, res){
	var id = req.params.id;
    if (!req.body) return res.sendStatus(400)

    fs.readFile('./data/resources.json', 'utf8', function (err, data) {
        if (err) throw err;

        var employees = JSON.parse(data.toString());
        employees.data.push(req.body.data)

        fs.writeFile ('./data/resources.json', JSON.stringify(employees, null, 2), function(err) {
            if (err) throw err;
            console.log('POST - added : ' + req.body.data.id);
        });
    });
	res.json(req.body);
    //res.sendStatus(200)
});

// person modified, patch file
app.patch('/resources/:id', jsonParser, function (req, res) {
	var id = req.params.id;
    if (!req.body) return res.sendStatus(400)
    //console.log(req.body)

    //console.log('readFile : ' + req.body.data.attributes.name)
    fs.readFile('./data/resources.json', 'utf8', function (err, data) {
        if (err){
            throw err;
            res.sendStatus(400)
        }

        var employees = JSON.parse(data.toString());
        //console.log(employees)
        for(employee in employees.data) {
            if(id == employees.data[employee].id){
                employees.data[employee] = req.body.data
                break;
            }
        }

        //console.log(JSON.stringify(employees, null, 2))
        console.log('replaced JSON: ' + req.body.data.attributes.name)

        fs.writeFile ('./data/resources.json', JSON.stringify(employees, null, 2), function(err) {
            if (err){
                console.log('patch error: ' + error)
                throw err;
                res.sendStatus(400)
            }
            console.log('PATCH complete : ' + req.body.data.id + ' ' + req.body.data.attributes.name);
        });
    });
	res.json(req.body);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
/**/


/*
app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
*/
