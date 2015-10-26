'use strict';
var serverPort = process.env.PORT || 8000;
var http = require('http');
var express = require('express');
var session = require('express-session');
var app = express();
var serverCreated = app.listen(serverPort);
var io = require('socket.io').listen(serverCreated);
var pg = require('pg');	
var router = express.Router();
var nodemailer = require('nodemailer');
var cryptoJS = require("crypto");
var algoritmo = 'aes-256-ctr';
var passAlgoritmo = 'pint4dr4domol4';
var transporter = nodemailer.createTransport();
var url_database = 'postgres://vqirkyzfmaagxq:TDNwprpRbTWJosQdqP-1YdjjU8@ec2-54-217-240-205.eu-west-1.compute.amazonaws.com:5432/ddmftfl54cvb0t?ssl=true';
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

app.use(session({secret: 'secretito'}));

pg.connect(url_database, function(err, client) {

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
			var winPlayer = "";
			if(puntosA > puntosB){
				io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'FELICIDADES!');
				io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'GANA A');
				winPlayer = roomSelected.playerA;
			} else if(puntosB > puntosA){
				io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'GANA B');
				io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'FELICIDADES!');
				winPlayer = roomSelected.playerB;
			} else {
				io.sockets.connected[roomSelected.users[roomSelected.playerA]].emit('partidaFinalizada', 'EMPATE');
				io.sockets.connected[roomSelected.users[roomSelected.playerB]].emit('partidaFinalizada', 'EMPATE');
			}

			if(winPlayer === roomSelected.playerA){
				client
					.query('UPDATE usuarios SET partidasGanadas = partidasGanadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerA]);
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerA]);
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerB]);
			} else if(winPlayer === roomSelected.playerB){
				client
					.query('UPDATE usuarios SET partidasGanadas = partidasGanadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerB]);
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerA]);
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerB]);
			} else if(winPlayer === ""){
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerA]);
				client
					.query('UPDATE usuarios SET partidasJugadas = partidasJugadas + 1 WHERE nombre = ($1)', [roomSelected.namePlayerB]);
			}

			console.log(roomSelected.namePlayerA + " - " + typeof roomSelected.namePlayerA);
			console.log(roomSelected.namePlayerB + " - " + typeof roomSelected.namePlayerB);
			console.log(puntosA + " - " + typeof puntosA);
			console.log(puntosB + " - " + typeof puntosB);
			client
				.query('INSERT INTO partidas (jugadorA, jugadorB, abandono, puntuacionA, puntuacionB) VALUES (($1), ($2), FALSE, ($3), ($4))', [roomSelected.namePlayerA, roomSelected.namePlayerB, puntosA, puntosB]);

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

	router.get('/getUsers', function(req,res){
		if(req.session.email === "asd"){
			var respuesta = [];
				client
					.query('SELECT * FROM usuarios')
					.on('row', function(row){
						respuesta.push(row);
					})
					.on('end', function(){
						res.send(respuesta);
					});	
		} else {
			res.status(404).send("Cannot GET "+req.url);
		}
	});

	router.get('/getPartidas', function(req,res){
		var respuesta = [];
		client
			.query('SELECT * FROM partidas')
			.on('row', function(row){
				respuesta.push(row);
			})
			.on('end', function(){
				res.send(respuesta);
			});	
	});

	router.get('/getPartidasPersonales', function(req,res){
		var nombre = req.session.nombre;
		var respuesta = [];
		client
			.query('SELECT * FROM partidas WHERE jugadorA=($1) OR jugadorB=($1) ORDER BY id DESC LIMIT 10', [nombre])
			.on('row',function(row){
				respuesta.push(row);
			})
			.on('end',function(){
				res.send(respuesta);
			});
	});

	router.get('/getUserByMail/:mail', function(req,res){
		var respuesta = [];
		var mailFiltered = req.params.mail;
		client
			.query("SELECT * FROM usuarios WHERE email=($1)", [mailFiltered])
			.on('row', function(row){
				respuesta.push(row);
			})
			.on('end', function(){
				res.send(respuesta);
			});
	});

	router.get('/checkIfUserExists/:mail', function(req,res){
		var respuesta = [];
		var mailFiltered = req.params.mail;
		client
			.query("SELECT email FROM usuarios WHERE email=($1)", [mailFiltered])
			.on('row', function(row){
				respuesta.push(row);
			})
			.on('end', function(){
				res.send(respuesta);
			});
	});

	router.get('/getThisUsername', function(req,res){
		res.send(req.session.nombre);
	});

	router.get('/setSessionUser/:mail/:nombre', function(req,res){
		req.session.email = req.params.mail;
		req.session.nombre = req.params.nombre;
		res.send(true);
	});

	router.get('/sessionDestroy', function(req,res){
		req.session.destroy();
		res.send(true);
	});

	router.get('/getRanking', function(req,res){
		var respuesta = [];
		client
			.query("SELECT email, nombre, partidasJugadas, partidasGanadas FROM usuarios ORDER BY partidasGanadas DESC limit 10")
			.on('row', function(row){
				respuesta.push(row);
			})
			.on('end', function(){
				respuesta.push(req.session.nombre);
				res.send(respuesta);
			});
	});

	router.get('/getUserPosition/:mail', function(req,res){
		var respuesta = [];
		var usuario = req.params.mail;
		client
			.query("SELECT email, partidasGanadas FROM usuarios ORDER BY partidasGanadas DESC")
			.on('row', function(row){
				respuesta.push(row.email);
			})
			.on('end', function(){
				res.send(respuesta);
			});
	});

	router.get('/postUser/:nombre/:email/:password', function(req, res){
		var nombre = req.params.nombre;
		var email = req.params.email;
		var password = req.params.password;
		var cipher = cryptoJS.createCipher(algoritmo,passAlgoritmo);
		var crypted = cipher.update(nombre+"-"+email,'utf8','hex');
		crypted += cipher.final('hex');
			client
				.query("INSERT INTO usuarios (nombre,email,password, partidasJugadas, partidasGanadas, abandonos, confirmado) VALUES (($1),($2),($3), 0, 0, 0, ($4))", [nombre, email, password, crypted])
				.on('end', function(){
					res.send(true);
				});
		var mailOptions = {
			from: 'accountcontrol.pintadrado@gmail.com',
			to: email,
			subject: 'Confirm Address',
			html: '<h3>Thank you for sing up in Pintadrado!</h3><p>Your username is '+nombre+' and your password is '+password+'.</p><p><a href="https://pintadrado.herokuapp.com/accountConfirm/'+crypted+'">Confirm account</a></p>'
		}
		transporter.sendMail(mailOptions, function(error, info){
			console.log(info.response);
		})
	});

	router.get('/accountConfirm/:hash', function(req,res){
		var hash = req.params.hash;
		var data = [];
		client
			.query("SELECT confirmado FROM usuarios WHERE confirmado = ($1)", [hash])
			.on('row', function(row){
				data.push(row);
			})
			.on('end', function(){
				if(data.length > 0){
					client
						.query("UPDATE usuarios SET confirmado = 'true' WHERE confirmado = ($1)", [hash])
						.on('end', function(){
							res.redirect("/");
						});
				}
			});
	});

	router.get('/', function(req,res){
		if(req.session.email === undefined){
			res.sendFile(__dirname + '/app/index.html');
		} else {
			res.redirect("/main");
		}
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

	/**********************************************/
	/***************** ADMIN RULES ****************/
	/**********************************************/

	router.get('/resetTables', function(req,res){
		console.log("Restarting tables...");
		client
			.query('DROP TABLE usuarios')
			.on('end', function(){
				console.log("CREATING TABLE USUARIOS");
				client
					.query('CREATE TABLE IF NOT EXISTS usuarios(id SERIAL PRIMARY KEY, nombre varchar(30),email varchar(50),password varchar(30),partidasJugadas int,partidasGanadas int,abandonos int,confirmado text)')
					.on('end',function(){
						console.log("TABLE USUARIOS CREATED");
					});
			});
		client
			.query('DROP TABLE partidas')
			.on('end', function(){
				console.log("CREATING TABLE PARTIDAS");
				client
					.query('CREATE TABLE IF NOT EXISTS partidas(id SERIAL PRIMARY KEY, jugadorA varchar(30), jugadorB varchar(30), abandono boolean, puntuacionA int, puntuacionB int)')
					.on('end',function(){
						console.log("TABLE PARTIDAS CREATED");
					});
			});
	});

	router.get('/resetUsers', function(req,res){
		console.log("Restarting users...");
			client
				.query("INSERT INTO usuarios (nombre,email,password, partidasJugadas, partidasGanadas, abandonos, confirmado) VALUES ('asd','asd','asd', 0, 0, 0, true)")
				.on('end',function(){
					console.log("asd ADDED TO USUARIOS");
				});
			client
				.query("INSERT INTO usuarios (nombre,email,password, partidasJugadas, partidasGanadas, abandonos, confirmado) VALUES ('ppp','ppp','ppp', 0, 0, 0, true)")
				.on('end',function(){
					console.log("ppp ADDED TO USUARIOS");
				});
	});

});
app.use("/app", express.static(__dirname + '/app'));

app.use(router);
