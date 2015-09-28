'use strict';
var serverPort = process.env.PORT || 8000;
var http = require('http');
var express = require('express');
var app = express();
var serverCreated = app.listen(serverPort);
var fs = require('fs');
var fs = require('fs');
var io = require('socket.io').listen(serverCreated);
var pg = require('pg');	
var router = express.Router();
var url_database = 'postgres://vqirkyzfmaagxq:TDNwprpRbTWJosQdqP-1YdjjU8@ec2-54-217-240-205.eu-west-1.compute.amazonaws.com:5432/ddmftfl54cvb0t?ssl=true';
var nSight = 0;
var rooms = {
	roomA: {
		playerA: '',
		playerB: '',
		namePlayerA: '',
		namePlayerB: '',
		colorPlayerA: '',
		colorPlayerB: '',
		turno: '',
		numPlayers: 0,
		users: {}
	},
	roomB: {
		playerA: '',
		playerB: '',
		namePlayerA: '',
		namePlayerB: '',
		colorPlayerA: '',
		colorPlayerB: '',
		turno: '',
		numPlayers: 0,
		users: {}
	},
	roomC: {
		playerA: '',
		playerB: '',
		namePlayerA: '',
		namePlayerB: '',
		colorPlayerA: '',
		colorPlayerB: '',
		turno: '',
		numPlayers: 0,
		users: {}
	},
	roomD: {
		playerA: '',
		playerB: '',
		namePlayerA: '',
		namePlayerB: '',
		colorPlayerA: '',
		colorPlayerB: '',
		turno: '',
		numPlayers: 0,
		users: {}
	},
	roomE: {
		playerA: '',
		playerB: '',
		namePlayerA: '',
		namePlayerB: '',
		colorPlayerA: '',
		colorPlayerB: '',
		turno: '',
		numPlayers: 0,
		users: {}
	}
	//...//
}

var ips = [];

var contentTypes={	".html":"text/html",
					".css":"text/css", 
					".js":"application/javascript", 
					".png":"image/png", 
					".jpg":"image/jpeg", 
					".ico":"image/x-icon"
				};

//http.listen(serverPort, function(){ 
//	console.log('Server running at http://localhost:' + serverPort); 
//}); 


io.on('connection', function(socket){

	var roomSelected;
	
	//if(ips.indexOf(socket.handshake.address) == -1){
		//ips.push(socket.handshake.address);
	for(var i in rooms){
		if(rooms[i].numPlayers < 2){
			console.log("Enta en la "+i);
			socket.join(rooms[0]);
			roomSelected = rooms[i];
			roomSelected.numPlayers++;
			break;
		}
	}

	if(roomSelected === undefined){
		console.log("NUESTRAS SALAS ESTAN LLENAS");
	}
	//} else {
	//	console.log("USUARIO YA CONECTADO");
	//}
	
	//var clients = io.sockets.adapter.rooms[rooms[0]];
	//var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
	
	socket.on('disconnect', function(){
		console.log(roomSelected.users[roomSelected.playerB]);
		if(roomSelected.playerA === "A" && socket.username === "B"){
			io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('infoLeave', roomSelected.namePlayerB);
		} else if(roomSelected.playerB === "B" && socket.username === "A"){
			io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('infoLeave', roomSelected.namePlayerA);
		}

		ips.splice(ips.indexOf(socket.handshake.address), 1);

		roomSelected.playerB = '';
		roomSelected.namePlayerB = '';
		roomSelected.colorPlayerB = '';
		roomSelected.pointsPlayerB = '';

		roomSelected.playerA = '';
		roomSelected.namePlayerA = '';
		roomSelected.colorPlayerA = '';
		roomSelected.pointsPlayerA = '';

		roomSelected.numPlayers = 0;
		roomSelected.users = {};
	});
	
	socket.on('clickEvent', function(bordes, color, id, pintado){
		io.sockets.emit('enviarCuadrados', bordes, color, id, pintado);
	});
	
	socket.on('join', function(username, color){
		if(roomSelected.playerA === ''){
			roomSelected.playerA = "A";
			socket.username = "A";
			roomSelected.namePlayerA = username;
			roomSelected.colorPlayerA = color;
			io.sockets.connected[socket.id].emit('loading');
			roomSelected.users[roomSelected.playerA] = socket.id;
		} else if(roomSelected.playerB === ''){
			roomSelected.playerB = "B";
			socket.username = "B";
			roomSelected.namePlayerB = username;
			roomSelected.colorPlayerB = color;
			roomSelected.users[roomSelected.playerB] = socket.id;
			io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('newPlayers', [roomSelected.playerA, roomSelected.namePlayerA, roomSelected.colorPlayerA], [roomSelected.playerB, roomSelected.namePlayerB, roomSelected.colorPlayerB]);
			io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('newPlayers', [roomSelected.playerA, roomSelected.namePlayerA, roomSelected.colorPlayerA], [roomSelected.playerB, roomSelected.namePlayerB, roomSelected.colorPlayerB]);
		}
	});

	socket.on('cambiarTurno', function(playerWithToken){
		if(playerWithToken === roomSelected.playerA){
			roomSelected.turno = roomSelected.playerB;
		} else if(playerWithToken === roomSelected.playerB){
			roomSelected.turno = roomSelected.playerA;
		}
		io.sockets.emit('turnoCambiado', socket.username);
	});

	socket.on('canIClick', function(){
		if(socket.username !== undefined){
			io.sockets.connected[roomSelected.users[socket.username]].emit('userClick', socket.username);
		}
	});

	socket.on('makePoints', function(id, puntos){
		io.sockets.emit('printPoints', id, puntos);
	});
	socket.on('comenzarPartida', function(){
		io.sockets.connected[roomSelected.users[socket.username]].emit('comenzarGame');
	});
	socket.on('finalizarPartida', function(puntosA, puntosB){
		if(puntosA > puntosB){
			io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'FELICIDADES!');
			io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'GANA A');
		} else if(puntosB > puntosA){
			io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'GANA B');
			io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'FELICIDADES!');
		} else {
			io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'EMPATE');
			io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'EMPATE');
		}

		roomSelected.playerB = '';
		roomSelected.namePlayerB = '';
		roomSelected.colorPlayerB = '';
		roomSelected.pointsPlayerB = '';

		roomSelected.playerA = '';
		roomSelected.namePlayerA = '';
		roomSelected.colorPlayerA = '';
		roomSelected.pointsPlayerA = '';

		roomSelected.numPlayers = 0;
		roomSelected.users = {};
	});
	socket.on('paintSquare', function(color, id){
		io.sockets.emit('squarePainted', color, id);
	});
});

function MyServer(request,response){
	var filePath = '.' + request.url;
	if (filePath == './'){
		filePath = './app/index.html';
	}
	var extname = filePath.substr(filePath.lastIndexOf('.'));
	var contentType = contentTypes[extname];
	if(!contentType){
		contentType = 'application/octet-stream';
	}
	
	fs.exists(filePath, function(exists){ 
		if(exists){
			fs.readFile(filePath, function(error, content){
				if(error){
					response.writeHead(500, { 'Content-Type': 'text/html' });
					response.end('<h1>500 Internal Server Error</h1>');
				} else{
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			}); 
		} else {
			response.writeHead(404, { 'Content-Type': 'text/html' });
			response.end('<h1>404 Not Found</h1>');
		}
	});
}

pg.connect(url_database, function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Creating tables...');

	router.get('/getUsers', function(req,res){
		var respuesta = [];
		client
			.query('SELECT * FROM usuarios')
			.on('row', function(row){
				respuesta.push(row);
			})
			.on('end', function(){
				res.send(respuesta);
			});	
	});

	router.get('/addUser', function(req,res){
		client
			.query("INSERT INTO usuarios VALUES(1, 'Kevin')");
		res.send("USUARIO INSERTADO");
	});

	router.get('/delTable', function(req,res){
		client
			.query('DROP TABLE usuarios');
		res.send("TABLA USUARIOS ELIMINADA");
	});

	router.get('/createTable', function(req,res){
		client
			.query('CREATE TABLE usuarios(id int, nombre varchar(20))');
		res.send("TABLA USUARIOS CREADA");
	});


	//client
	//	.query('CREATE TABLE IF NOT EXISTS prueba(col1 int, col2 int)');

	//client
	//	.query('DROP TABLE prueba');
	
	//client
	//	.query('INSERT INTO prueba VALUES (1, 2)')
	//	.on('row', function(row) {
	//		console.log(JSON.stringify(row));
	//});

	//client
	//	.query('SELECT * FROM prueba')
	//	.on('row', function(row) {
	//		console.log(row.col1);
	//	})
	//	.on('end',function(){
	//		client.end();
	//});

});

router.get('/', function(req,res){
	res.sendFile(__dirname + '/app/index.html');
});

router.get('/main', function(req,res){
	res.sendFile(__dirname + '/app/main.html');
});

router.get('/game', function(req,res){
	res.sendFile(__dirname + '/app/game.html');
});

app.use("/app", express.static(__dirname + '/app'));

app.use(router);

//app.listen(serverPort);
//app.listen(serverPort);
//serverCreated.listen(serverPort);