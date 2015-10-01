'use strict';
var serverPort = process.env.PORT || 8000;
var http = require('http');
var express = require('express');
var session = require('express-session');
var app = express();
var serverCreated = app.listen(serverPort);
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

app.use(session({secret: 'secretito'}));

pg.connect(url_database, function(err, client) {
	console.log('Connected to postgres! Creating tables...');
	console.log("Creating \"usuarios\"");
	client
		.query('CREATE TABLE IF NOT EXISTS usuarios(id int, nombre varchar(30),email varchar(50),password varchar(30),partidasJugadas int,partidasGanadas int,abandonos int)')
		.on('end', function(){
			client.end();
		});
});

router.get('/getUsers', function(req,res){
	if(req.session.email === "asd"){
		var respuesta = [];
		pg.connect(url_database, function(err, client) {
			client
				.query('SELECT * FROM usuarios')
				.on('row', function(row){
					respuesta.push(row);
				})
				.on('end', function(){
					res.send(respuesta);
					client.end();
				});	
		});
	} else {
		res.status(404).send("Cannot GET "+req.url);
	}
});

router.get('/getUserByMail/:mail', function(req,res){
	var respuesta = [];
	var mailFiltered = req.params.mail;
	pg.connect(url_database, function(err, client) {
	client
		.query("SELECT * FROM usuarios WHERE email=($1)", [mailFiltered])
		.on('row', function(row){
			respuesta.push(row);
		})
		.on('end', function(){
			res.send(respuesta);
			client.end();
		});
	});
});

router.get('/setSessionUser/:mail', function(req,res){
	req.session.email = req.params.mail;
	res.send(true);
});

router.get('/sessionDestroy', function(req,res){
	req.session.destroy();
	res.send(true);
});

router.get('/getRanking', function(req,res){
	var respuesta = [];
	pg.connect(url_database, function(err, client) {
	client
		.query("SELECT nombre, partidasJugadas, partidasGanadas FROM usuarios ORDER BY partidasGanadas DESC limit 10")
		.on('row', function(row){
			respuesta.push(row);
		})
		.on('end', function(){
			res.send(respuesta);
			client.end();
		});
	});
});

router.get('/postUser/:id/:nombre/:email/:password', function(req, res){
	var id = req.params.id;
	var nombre = req.params.nombre;
	var email = req.params.email;
	var password = req.params.password;
	pg.connect(url_database, function(err, client) {
		client
			.query("INSERT INTO usuarios VALUES (($1),($2),($3),($4), 0, 0, 0)", [id, nombre, email, password])
			.on('end', function(){
				res.send(true);
				client.end();
			});
	});
});

router.get('/addUser', function(req,res){
	pg.connect(url_database, function(err, client) {
		client
			.query("INSERT INTO usuarios VALUES(1, 'Kevin', 'prueba@gmail.com', 'patata123', 3, 2, 0)")
			.on('end', function(){
				client.end();
			});
		res.send("USUARIO INSERTADO");
	});
});

router.get('/delTable', function(req,res){
	pg.connect(url_database, function(err, client) {
		client
			.query('DROP TABLE usuarios')
			.on('end', function(){
				client.end();
			});
		res.send("TABLA USUARIOS ELIMINADA");
	});
});

router.get('/', function(req,res){
	res.sendFile(__dirname + '/app/index.html');
});

router.get('/main', function(req,res){
	if(req.session.email !== undefined){
		res.sendFile(__dirname + '/app/main.html');
	} else {
		res.redirect("/");
	}
});

router.get('/game', function(req,res){
	if(req.session.email !== undefined){
		res.sendFile(__dirname + '/app/game.html');
	} else {
		res.redirect("/");
	}
});

app.use("/app", express.static(__dirname + '/app'));

app.use(router);
