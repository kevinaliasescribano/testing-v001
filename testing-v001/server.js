'use strict';
var serverPort = process.env.PORT || 8000;
var http = require('http').createServer(MyServer);
var fs = require('fs');
var io = require('socket.io').listen(http);
var nSight = 0;
var rooms = ['roomA','roomB','roomC','roomD','roomE','roomF','roomG','roomH','roomI','roomJ'];
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

var users = {};

var playerA;
var playerB;
var namePlayerA;
var namePlayerB;
var colorPlayerA;
var colorPlayerB;
var pointsPlayerA;
var pointsPlayerB;
var turno;

io.on('connection', function(socket){
	
	
	socket.join(rooms[0]);
	
	var clients = io.sockets.adapter.rooms[rooms[0]];
	var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
	
	socket.on('disconnect', function(){
		
	});
	
	socket.on('clickEvent', function(bordes, color, id){
		io.sockets.emit('enviarCuadrados', bordes, color, id);
	});
	
	socket.on('join', function(username, color){
		socket.username = username;
		users[username] = socket.id;
		if(playerA === undefined){
			playerA = "A";
			namePlayerA = username;
			colorPlayerA = color;
			io.sockets.connected[socket.id].emit('loading');
		} else if(playerB === undefined){
			playerB = "B";
			namePlayerB = username;
			colorPlayerB = color;
			io.sockets.emit('newPlayers', [playerA, namePlayerA, colorPlayerA], [playerB, namePlayerB, colorPlayerB]);
		}
	});

	socket.on('cambiarTurno', function(playerWithToken){
		if(playerWithToken === playerA){
			turno = playerB;
		} else if(playerWithToken === playerB){
			turno = playerA;
		}
		io.sockets.emit('turnoCambiado', socket.username);
	});

	socket.on('canIClick', function(){
		io.sockets.connected[users[socket.username]].emit('userClick', socket.username);
	});

	socket.on('makePoints', function(id, puntos){
		io.sockets.emit('printPoints', id, puntos);
	});
});

function MyServer(request,response){
	var filePath = '.' + request.url;
	if (filePath == './'){
		filePath = './index.html';
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