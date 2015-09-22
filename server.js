'use strict';
var serverPort = process.env.PORT || 8000;
var http = require('http').createServer(MyServer);
var fs = require('fs');
var io = require('socket.io').listen(http);
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

http.listen(serverPort, function(){ 
	console.log('Server running at http://localhost:' + serverPort); 
}); 


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
		filePath = './pruebacanvas3.html';
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