
	
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext('2d');
	var socket = io.connect("http://localhost:8000/app/game.hmtl");
	
	var colorLineas = 'rgb(230,230,230)';
	var partidaComenzada = false;
	var creado = false;
	var posXact = 0;
	var posYact = 0;
	//var squareSize = 148;
	var squareSize = 18;
	var paintStop = true;
	var cuadrados = [];
	var bordesPintados = [];
	var cuadradoActual;
	var cuadradoAnterior;
	var playerA;
	var playerB;
	var turnoPlayer;
	var puedoHacerClick = true;
	var x;
	var y;
	var completed = false;
	
	window.requestAnimationFrame = (function () {
		return window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 17);
			};
	}());
	
	function paint(ctx){
		ctx.fillStyle = colorLineas;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		ctx.fillStyle = 'white';
		if(!creado){
			crearCuadrados(ctx);
		} else {
			pintarCuadrados(ctx);
		}
	}

	function crearCuadrados(ctx){
		posXact = 0;
		posYact = 0;
		cont = 0;
		while(!creado){
		
			bordesPintados = {top: [false, 'black'], right: [false, 'black'], bottom: [false, 'black'], left: [false, 'black']};
			if(posXact === 0 && posYact === 0){
				bordesPintados.top[0] = true;
				bordesPintados.left[0] = true;
			} else if(posXact === (canvas.width - squareSize - 2) && posYact === (canvas.height - squareSize - 2)){
				bordesPintados.right[0] = true;
				bordesPintados.bottom[0] = true;
			} else if (posXact === 0 && posYact === (canvas.height- squareSize - 2)){
				bordesPintados.left[0] = true;
				bordesPintados.bottom[0] = true;
			} else if (posXact === (canvas.width - squareSize - 2) && posYact === 0){
				bordesPintados.right[0] = true;
				bordesPintados.top[0] = true;
			} else if(posXact === 0){
				bordesPintados.left[0] = true;
			} else if(posYact === 0){
				bordesPintados.top[0] = true;
			} else if(posXact === (canvas.width - squareSize - 2)){
				bordesPintados.right[0] = true;
			} else if(posYact === (canvas.height - squareSize - 2)){
				bordesPintados.bottom[0] = true;
			}
			
			cuadrados.push(new Cuadrado(posXact + 1, posYact + 1, squareSize, 'white', bordesPintados, cont));
			posXact += squareSize + 2;
			if(posXact >= canvas.width){
				posXact = 0
				posYact += squareSize + 2;
				if(posYact >= canvas.height){
					creado = true;
				}
			}
			cont++;
		}
	}
	
	function pintarCuadrados(ctx){
		for(i in cuadrados){
			ctx.fillStyle = cuadrados[i].getColor();
			ctx.fillRect(cuadrados[i].values()[0],cuadrados[i].values()[1],cuadrados[i].values()[2],cuadrados[i].values()[2]);
			ctx.beginPath(); 
			if(cuadrados[i].getBordesPintados()['top'][0] === true){
				// LINEA ARRIBA
				ctx.fillStyle = cuadrados[i].getBordesPintados()['top'][1];
				ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
				ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
			}
			if(cuadrados[i].getBordesPintados()['right'][0] === true){
				// LINEA DERECHA
				ctx.fillStyle = cuadrados[i].getBordesPintados()['right'][1];
				ctx.moveTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
				ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
			}
			if(cuadrados[i].getBordesPintados()['bottom'][0] === true){
				// LINEA ABAJO
				ctx.fillStyle = cuadrados[i].getBordesPintados()['bottom'][1];
				ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
				ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
			}
			if(cuadrados[i].getBordesPintados()['left'][0] === true){
				// LINEA IZQUIERDA
				ctx.fillStyle = cuadrados[i].getBordesPintados()['left'][1];
				ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
				ctx.lineTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
			}
			for(j in cuadrados[i].getBordesPintados()){
				if(cuadrados[i].getBordesPintados()[j][0] === 'swap'){
					ctx.fillStyle = turnoPlayer.getColor();
					if(j === 'top'){
						// LINEA ARRIBA
						ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
						ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
					}
					if(j === 'right'){
						// LINEA DERECHA
						ctx.moveTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
						ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
					}
					if(j === 'bottom'){
						// LINEA ABAJO
						ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
						ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
					}
					if(j === 'left'){
						// LINEA IZQUIERDA
						ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
						ctx.lineTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
					}
				}
			}
			ctx.stroke();
		}
		paintStop = true;
	}
	
	function Cuadrado(x,y,size,color,bordesPintados,id){
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = color;
		this.bordesPintados = bordesPintados;
		this.id = id;
		this.colored = false;
		
		this.areaAbarcada = function(){
			return [this.x, this.x + this.size, this.y, this.y + this.size];
		}
		
		this.values = function(){
			return [this.x, this.y, this.size];
		}
		
		this.getColor = function(){
			return this.color;
		}
		
		this.setColor = function(color){
			this.color = color;
		}
		
		this.getBordesPintados = function(){
			return this.bordesPintados;
		}
		
		this.setBordesPintados = function(bordesPintados){
			this.bordesPintados = bordesPintados;
		}
		
		this.pintarBorde = function(numeroBorde){
			this.bordesPintados[numeroBorde] = true;
		}
		
		this.getId = function(){
			return this.id;
		}
		
		this.changeColored = function(){
			this.colored = true;
		}
		
		this.getColored = function(){
			return this.colored;
		}
	}
	
	function Player(id, username, color, puntos){
		this.id = id;
		this.username = username;
		this.color = color;
		this.puntos = puntos;
		
		this.getId = function(){
			return this.id;
		}

		this.setUsername = function(username){
			this.username = username;
		}
		
		this.getUsername = function(){
			return this.username;
		}
		
		this.getPuntos = function(){
			return this.puntos;
		}
		
		this.setPuntos = function(puntos){
			this.puntos = puntos;
		}
		
		this.getColor = function(){
			return this.color;
		}
	}

	function moverRaton(evt, ctx){
		if(/firefox/.test(navigator.userAgent.toLowerCase())){
			x = evt.layerX;
			y = evt.layerY;
		} else {
			x = evt.x;
			y = evt.y;
		}
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		for(i in cuadrados){
			if(x >= cuadrados[i].areaAbarcada()[0] && x <= cuadrados[i].areaAbarcada()[1] && y >= cuadrados[i].areaAbarcada()[2] && y <= cuadrados[i].areaAbarcada()[3]){
				cuadradoActual = cuadrados[i].getId();
				ctx.beginPath();
				var hoverOnElement = false;
				for(j in cuadrados[i].getBordesPintados()){
					if(cuadrados[i].getBordesPintados()[j][0] === 'swap'){
						hoverOnElement = true;
					}
				}
				if(!hoverOnElement){
					if(cuadrados[i].getBordesPintados().top[0] === true){
						if(cuadrados[i].getBordesPintados().right[0] === true){
							if(cuadrados[i].getBordesPintados().bottom[0] === true){
								if(cuadrados[i].getBordesPintados().left[0] === true){
									ctx.moveTo(0,0);
									ctx.lineTo(0,0);
								} else {
									// LINEA IZQUIERDA
									cuadrados[i].getBordesPintados().left[0] = 'on';
									ctx.fillStyle = cuadrados[i].getBordesPintados().left[1];
									ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
									ctx.lineTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
								}
							} else {
								// LINEA ABAJO
								cuadrados[i].getBordesPintados().bottom[0] = 'on';
								ctx.fillStyle = cuadrados[i].getBordesPintados().bottom[1];
								ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[3]);
								ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
							}
						} else {
							// LINEA DERECHA
							cuadrados[i].getBordesPintados().right[0] = 'on';
							ctx.fillStyle = cuadrados[i].getBordesPintados().right[1];
							ctx.moveTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
							ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[3]);
						}
					} else {
						// LINEA ARRIBA
						cuadrados[i].getBordesPintados().top[0] = 'on';
						ctx.fillStyle = cuadrados[i].getBordesPintados().top[1];
						ctx.moveTo(cuadrados[i].areaAbarcada()[0],cuadrados[i].areaAbarcada()[2]);
						ctx.lineTo(cuadrados[i].areaAbarcada()[1],cuadrados[i].areaAbarcada()[2]);
					}
				}
				ctx.stroke();
			}
		}
		if(cuadradoAnterior === undefined){
			cuadradoAnterior = cuadradoActual;
		}
		if(cuadradoActual !== cuadradoAnterior){
			for(i in cuadrados[cuadradoAnterior].getBordesPintados()){
				if(cuadrados[cuadradoAnterior].getBordesPintados()[i][0] === 'swap'){
					cuadrados[cuadradoAnterior].getBordesPintados()[i][0] = false;
				}
			}
			pintarCuadrados(ctx);
			paintStop = false;
			cuadradoAnterior = cuadradoActual;
		} else {
		}
	}
	
	function pulsarTecla(evt, ctx){
		if(evt.keyCode == 32){
			for(i in cuadrados){
				if(x >= cuadrados[i].areaAbarcada()[0] && x <= cuadrados[i].areaAbarcada()[1] && y >= cuadrados[i].areaAbarcada()[2] && y <= cuadrados[i].areaAbarcada()[3]){
					console.log(cuadrados[i]);
					iteracionCuadrado(cuadrados[i], ctx);
				}
			}
		}
	}
	
	function iteracionCuadrado(elem, ctx){
		var haveSwapBorder = false;
		for (i in elem.getBordesPintados()){
			if(elem.getBordesPintados()[i][0] === 'swap'){
				haveSwapBorder = true;
			}
		}
		if(haveSwapBorder){
			var borderWithSwap;
			var cambiado = false;
			var positions = ['top','right','bottom','left'];
			var token;
			for (i in elem.getBordesPintados()){
				if(elem.getBordesPintados()[i][0] === 'swap'){
					borderWithSwap = elem.getBordesPintados()[i];
					token = positions.indexOf(i) + 1;
				}
			}
			
			while(!cambiado){
				if(token > 3){
					token = 0;
				}
				var pos = positions[token];
				if(elem.getBordesPintados()[pos][0] === false){
					borderWithSwap[0] = false;
					elem.getBordesPintados()[positions[token]][0] = 'swap';
					borderWithSwap = elem.getBordesPintados()[pos];
					cambiado = true;
				} else if (elem.getBordesPintados()[positions[token]][0] === 'on'){
					borderWithSwap[0] = false;
					cambiado = true;
				} else {
					token++;
				}
			}
		} else {
			var borderWithOn;
			var cambiado = false;
			var positions = ['top','right','bottom','left'];
			var token;
			for (i in elem.getBordesPintados()){
				if(elem.getBordesPintados()[i][0] === 'on'){
					borderWithOn = elem.getBordesPintados()[i];
					token = positions.indexOf(i) + 1;
				}
			}

			borderWithOn[0] = false;
			
			while(!cambiado){
				if(token > 3){
					token = 0;
				}
				var pos = positions[token];
				if(elem.getBordesPintados()[pos][0] === false){
					elem.getBordesPintados()[positions[token]][0] = 'swap';
					cambiado = true;
				} else if (elem.getBordesPintados()[positions[token+1]][0] === 'on'){
					cambiado = true;
				} else {
					token++;
				}
			}
		}
		paintStop = false;
	}
	
	function clickRaton(evt, ctx){
		if(puedoHacerClick){

			var swapedBorder = false;
			var changeTurn = true;
			var painted = false;
			if(/firefox/.test(navigator.userAgent.toLowerCase())){
				x = evt.layerX;
				y = evt.layerY;
			} else {
				x = evt.x;
				y = evt.y;
			}
			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;
			var cols = canvas.width / (squareSize + 2);
			var rows = canvas.height / (squareSize + 2);
			
			for(i in cuadrados){
				if(x >= cuadrados[i].areaAbarcada()[0] && x <= cuadrados[i].areaAbarcada()[1] && y >= cuadrados[i].areaAbarcada()[2] && y <= cuadrados[i].areaAbarcada()[3]){
					if(cuadrados[i].getColored() === false){
						for(j in cuadrados[i].getBordesPintados()){
							if(cuadrados[i].getBordesPintados()[j][0] == 'swap'){
								cuadrados[i].getBordesPintados()[j][0] = true;
								cuadrados[i].getBordesPintados()[j][1] = turnoPlayer.getColor();
								// COJER EL CUADRADO ANTERIOR Y MARCA TRUE AL BORDE OPUESTO A ESTE
								if(j === 'top'){
									if(cuadrados[parseInt(i)-cols] != undefined){
										cuadrados[parseInt(i)-cols].getBordesPintados()['bottom'][0] = true;
										cuadrados[parseInt(i)-cols].getBordesPintados()['bottom'][1] = turnoPlayer.getColor();

										socket.emit('clickEvent', cuadrados[parseInt(i)-cols].getBordesPintados(), cuadrados[parseInt(i)-cols].getColor(), parseInt(i)-cols, cuadrados[parseInt(i)-cols].getColored());
									}
								} else if(j === 'right'){
									if(cuadrados[parseInt(i)+1] != undefined){
										cuadrados[parseInt(i)+1].getBordesPintados()['left'][0] = true;
										cuadrados[parseInt(i)+1].getBordesPintados()['left'][1] = turnoPlayer.getColor();

										socket.emit('clickEvent', cuadrados[parseInt(i)+1].getBordesPintados(), cuadrados[parseInt(i)+1].getColor(), parseInt(i)+1, cuadrados[parseInt(i)+1].getColored());
									}
								} else if(j === 'bottom'){
									if(cuadrados[parseInt(i)+cols] != undefined){
										cuadrados[parseInt(i)+cols].getBordesPintados()['top'][0] = true;
										cuadrados[parseInt(i)+cols].getBordesPintados()['top'][1] = turnoPlayer.getColor();

										socket.emit('clickEvent', cuadrados[parseInt(i)+cols].getBordesPintados(), cuadrados[parseInt(i)+cols].getColor(), parseInt(i)+cols, cuadrados[parseInt(i)+cols].getColored());
									}
								} else if(j === 'left'){
									if(cuadrados[parseInt(i)-1] != undefined){
										cuadrados[parseInt(i)-1].getBordesPintados()['right'][0] = true;
										cuadrados[parseInt(i)-1].getBordesPintados()['right'][1] = turnoPlayer.getColor();

										socket.emit('clickEvent', cuadrados[parseInt(i)-1].getBordesPintados(), cuadrados[parseInt(i)-1].getColor(), parseInt(i)-1, cuadrados[parseInt(i)-1].getColored());
									}
								}
								swapedBorder = true;
							}
						}
						if(!swapedBorder){
							for(j in cuadrados[i].getBordesPintados()){
								if(cuadrados[i].getBordesPintados()[j][0] == 'on'){
									cuadrados[i].getBordesPintados()[j][0] = true;
									cuadrados[i].getBordesPintados()[j][1] = turnoPlayer.getColor();
									if(j === 'top'){
										if(cuadrados[parseInt(i)-cols] != undefined){
											cuadrados[parseInt(i)-cols].getBordesPintados()['bottom'][0] = true;
											cuadrados[parseInt(i)-cols].getBordesPintados()['bottom'][1] = turnoPlayer.getColor();
											painted = true;
											socket.emit('clickEvent', cuadrados[parseInt(i)-cols].getBordesPintados(), cuadrados[parseInt(i)-cols].getColor(), parseInt(i)-cols, cuadrados[parseInt(i)-cols].getColored());
										}
									} else if(j === 'right'){
										if(cuadrados[parseInt(i)+1] != undefined){
											cuadrados[parseInt(i)+1].getBordesPintados()['left'][0] = true;
											cuadrados[parseInt(i)+1].getBordesPintados()['left'][1] = turnoPlayer.getColor();
											painted = true;
											socket.emit('clickEvent', cuadrados[parseInt(i)+1].getBordesPintados(), cuadrados[parseInt(i)+1].getColor(), parseInt(i)+1, cuadrados[parseInt(i)+1].getColored());
										}
									} else if(j === 'bottom'){
										if(cuadrados[parseInt(i)+cols] != undefined){
											cuadrados[parseInt(i)+cols].getBordesPintados()['top'][0] = true;
											cuadrados[parseInt(i)+cols].getBordesPintados()['top'][1] = turnoPlayer.getColor();
											painted = true;
											socket.emit('clickEvent', cuadrados[parseInt(i)+cols].getBordesPintados(), cuadrados[parseInt(i)+cols].getColor(), parseInt(i)+cols, cuadrados[parseInt(i)+cols].getColored());
										}
									} else if(j === 'left'){
										if(cuadrados[parseInt(i)-1] != undefined){
											cuadrados[parseInt(i)-1].getBordesPintados()['right'][0] = true;
											cuadrados[parseInt(i)-1].getBordesPintados()['right'][1] = turnoPlayer.getColor();
											painted = true;
											socket.emit('clickEvent', cuadrados[parseInt(i)-1].getBordesPintados(), cuadrados[parseInt(i)-1].getColor(), parseInt(i)-1, cuadrados[parseInt(i)-1].getColored());
										}
									}
								}
							}
						}
						changeTurn = true;
						if(cuadrados[i].getBordesPintados()['top'][0] === true && cuadrados[i].getBordesPintados()['right'][0] === true && cuadrados[i].getBordesPintados()['bottom'][0] === true && cuadrados[i].getBordesPintados()['left'][0] === true){
							var puntosActuales = turnoPlayer.getPuntos();
							puntosActuales++;
							turnoPlayer.setPuntos(puntosActuales);
							socket.emit('makePoints', turnoPlayer.getId(), puntosActuales);
							socket.emit('paintSquare', turnoPlayer.getColor(), i);
							cuadrados[i].setColor(turnoPlayer.getColor());
							cuadrados[i].changeColored();
							ctx.fillStyle = cuadrados[i].getColor();
							ctx.fillRect(cuadrados[i].values()[0],cuadrados[i].values()[1],cuadrados[i].values()[2],cuadrados[i].values()[2]);
							changeTurn = false;
						}
					} else {
						changeTurn = false;
					}
					socket.emit('clickEvent', cuadrados[i].getBordesPintados(), cuadrados[i].getColor(), i, cuadrados[i].getColored());
					completed = true;
					for(j in cuadrados){
						if(cuadrados[j].getColored() === false){
							completed = false;
						}
					}
					if(completed){
						socket.emit('finalizarPartida', playerA.getPuntos(), playerB.getPuntos());
					}
				}
			}
			var finish = true;
			for(i in cuadrados){
				if(cuadrados[i].getColored() === false){
					if(cuadrados[i].getBordesPintados()['top'][0] === true && cuadrados[i].getBordesPintados()['right'][0] === true && cuadrados[i].getBordesPintados()['bottom'][0] === true && cuadrados[i].getBordesPintados()['left'][0] === true){
						var puntosActuales = turnoPlayer.getPuntos();
						puntosActuales++;
						turnoPlayer.setPuntos(puntosActuales);
						socket.emit('makePoints', turnoPlayer.getId(), puntosActuales);
						socket.emit('paintSquare', turnoPlayer.getColor(), i);
						cuadrados[i].setColor(turnoPlayer.getColor());
						cuadrados[i].changeColored();
						ctx.fillStyle = cuadrados[i].getColor();
						ctx.fillRect(cuadrados[i].values()[0],cuadrados[i].values()[1],cuadrados[i].values()[2],cuadrados[i].values()[2]);
						socket.emit('clickEvent', cuadrados[i].getBordesPintados(), cuadrados[i].getColor(), i, cuadrados[i].getColored());
						changeTurn = false;
					} else {
						finish = false;
					}
				}
			}
			if(finish){
				socket.emit('finalizarPartida', playerA.getPuntos(), playerB.getPuntos());
			}

			if(changeTurn && painted){
				socket.emit('cambiarTurno', turnoPlayer.getId());
			}


		}
		
		paintStop = false;
	}

	function act(){
		
	}
	
	function run() {
		window.requestAnimationFrame(run);
		if(!paintStop){
			if(partidaComenzada){
				socket.emit('canIClick');
			}
			act();
			paint(ctx);
		}
	}
	
	function init() {
		run();
		enableSockets();
		$('#goButton').on('click',function(){
			$.ajax({
				url: "/getThisUsername"
			})
			.done(function(data){
				socket.emit('join',data, $('#userColor').val());
			});
			$('#divInfo').hide();
			paintStop = false;
		});
	}
	
	function enableSockets(){
		socket = io.connect();
		socket.on('enviarCuadrados', function(bordes, color, id, pintado){
			cuadrados[id].setColor(color);
			cuadrados[id].setBordesPintados(bordes);
			paintStop = false;
		});
		socket.on('loading', function(){
			$('#waitingPlayer').show(300);
		});
		socket.on('newPlayers', function(jugador1, jugador2){
			playerA = new Player(jugador1[0], jugador1[1], jugador1[2], 0);
			playerB = new Player(jugador2[0], jugador2[1], jugador2[2], 0);
			$('#nombreA').text(playerA.getUsername());
			$('#nombreB').text(playerB.getUsername());
			turnoPlayer = playerA;
			$('#userA').text(playerA.getUsername());
			$('#puntosA').text(playerA.getPuntos());
			if($('#userA').text() === playerB.getUsername()){
				$('#userB').text(playerB.getUsername() + "(1)");
			} else {
				$('#userB').text(playerB.getUsername());
			}
			$('#puntosB').text(playerB.getPuntos());
			$('#waitingPlayer').fadeOut(300 ,function(){
				$('#divGame').fadeIn(300);
			});
			$('#cuadroColorA').css('background-color', playerA.getColor());
			$('#cuadroColorB').css('background-color', playerB.getColor());
			$('#cuadroColorB').addClass('inactive');
			socket.emit('canIClick');
			socket.emit('comenzarPartida');
		});
		socket.on('turnoCambiado', function(usuario){
			if(usuario === playerA.getId()){
				turnoPlayer = playerB;
				$('#cuadroColorA').addClass('inactive');
				$('#cuadroColorB').removeClass('inactive');
				$('#iconoFlecha').addClass('inverse');
			} else if(usuario === playerB.getId()){
				turnoPlayer = playerA;
				$('#cuadroColorA').removeClass('inactive');
				$('#cuadroColorB').addClass('inactive');
				$('#iconoFlecha').removeClass('inverse');
			}
		});
		socket.on('userClick', function(usuario){
			if(turnoPlayer.getId() === usuario){
				puedoHacerClick = true;
			} else {
				puedoHacerClick = false;
			}
		});
		socket.on('printPoints', function(id, puntos){
			if(id === playerA.getId()){
				playerA.setPuntos(puntos);
				$('#puntosA').text(puntos);
			} else if(id === playerB.getId()){
				playerB.setPuntos(puntos);
				$('#puntosB').text(puntos);
			}
		});
		socket.on('infoLeave', function(userLeave){
			alert("El usuario "+userLeave+" ha abandonado la partida.");
			$('#lightbox').fadeIn(200);
			$('#darkness').fadeIn(200);
		});
		socket.on('comenzarGame', function(){
			partidaComenzada = true;
		});
		socket.on('partidaFinalizada', function(text){
			alert(text);
			$('#divGame').hide(300);
			$('#darkness').fadeIn(200);
			$('#lightbox').fadeIn(200);
			$('#lightbox').addClass('finish');
			$('#nombreResultA').text(playerA.getUsername());
			$('#nombreResultB').text(playerB.getUsername());
			$('#results').show(300);
			$('#marcadorA').css('background-color', playerA.getColor());
			$('#marcadorB').css('background-color', playerB.getColor());

			var alturaCalculadaA = (playerA.getPuntos() * 80) / cuadrados.length;
			$('#marcadorA').css('max-height', alturaCalculadaA);
			var alturaCalculadaB = (playerB.getPuntos() * 80) / cuadrados.length;
			$('#marcadorB').css('max-height', alturaCalculadaB);
		});
		socket.on('squarePainted', function(color, id){
			cuadrados[id].changeColored();
		});
	}

	window.onload = function(){
		init();
		$('#divGame').hide();
		$('#waitingPlayer').hide();
		$('#lightbox').hide();
		$('#darkness').hide();
		$('#results').hide();
	}
	
	document.addEventListener('keyup', function(evt){

		pulsarTecla(evt, ctx);
	});
	
	document.getElementById('canvas').addEventListener('mousemove', function(evt){
		moverRaton(evt, ctx);
	});
	
	document.getElementById('canvas').addEventListener("click", function(evt){
		clickRaton(evt, ctx);
	});
	


(function(){
	document.getElementById('canvas').oncontextmenu = function(){
		return false;
	};
}());