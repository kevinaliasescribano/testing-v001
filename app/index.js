$('#botonPrueba').on('click', function(){
	var email = $('.loginForm input[name="mail"]').val();
	var pass = $('.loginForm input[name="pass"]').val();
	$.ajax({
		url: "/getUserByMail/"+email
	})
	.done(function(data){
		if(data[0] === undefined){
			$('#loginError').show();
		} else {
			if(data[0].password === pass){
				$.ajax({
					url: '/setSessionUser/'+email+'/'+data[0].nombre
				})
				.done(function(data){
					if(data){
						window.location.replace("/main");
					}
				});
			} else {
				$('#loginError').show();
			}
		}
	});
});

$('.options').on('click', function(){
	$('#mainDiv').slideUp(300);
	if($(this).attr('id') === "opcion1"){
		$('#stats').slideDown(300);
		if($('#stats table tr').length <= 1){
			$.ajax({
				url: "/getRanking"
			})
			.done(function(data){
				var existsInRanking = false;
				var mailToFilter;
				for(i in data){
					if(i < data.length - 1){
						// REDONDEO A 2 DECIMALES
						var percentaje = Math.round(data[i].partidasganadas/data[i].partidasjugadas*100*100) / 100;
						if(isNaN(percentaje)){
							percentaje = 0;
						}
						$('#stats table').append("<tr><td>"+(parseInt(i)+1)+"</td><td>"+data[i].nombre+"</td><td>"+data[i].partidasjugadas+"</td><td>"+data[i].partidasganadas+"</td><td>"+percentaje+"%</td></tr>");
					} 
					if(data[data.length-1] === data[i].nombre){
						existsInRanking = true;
						$('#stats table tr').last().css('background-color','yellow');
					}
				}
				if(!existsInRanking){
					var mailToFilter = data[data.length-1];
					$.ajax({
						url: "/getUserByMail/"+mailToFilter
					})
					.done(function(data2){
						var percentaje = Math.round(data2[0].partidasganadas/data2[0].partidasjugadas*100*100) / 100;
						if(isNaN(percentaje)){
							percentaje = 0;
						}
						$.ajax({
							url: "/getUserPosition/"+mailToFilter,
						})
						.done(function(data3){
							var position = parseInt(data3.indexOf(mailToFilter)) + 1;
							$('#stats table').append("<tr><td>"+position+"</td><td>"+data2[0].nombre+"</td><td>"+data2[0].partidasjugadas+"</td><td>"+data2[0].partidasganadas+"</td><td>"+percentaje+"%</td></tr>");
							$('#stats table tr').last().css('background-color','yellow');
						})
					});
				}
			});
		}
		
	} else if($(this).attr('id') === "opcion2"){
		window.location.replace("/game");
	} else if($(this).attr('id') === "opcion3"){
		$('#profile').slideDown(300);
	}
});

$('#makeRegis').on('click', function(){
	//var id = $('.regisForm input[name="id"]').val();
	var nombre = $('.regisForm input[name="nombre"]').val();
	var email = $('.regisForm input[name="email"]').val();
	var password = $('.regisForm input[name="password"]').val();
	$.ajax({
		url: "/getUserByMail/"+email
	})
	.done(function(data){
		if(data[0] === undefined){
			$.ajax({
				url: "/postUser/"+nombre+"/"+email+"/"+password,
				data: {nombre: nombre, email: email, password: password}
			})
			.done(function(data){
				if(data === true){
					alert("USUARIO INSERTADO CORRECTAMENTE");
					window.location.reload();
				}
			});
		}
	});
	
});

$('#toLogin').on('click', function(){
	$('.loginForm').show();
	$('.buttonSpace').hide();
	$('#lightbox').fadeIn(200);
	$('#darkness').fadeIn(200);
});

$('#toRegis').on('click', function(){
	$('.regisForm').show();
	$('.buttonSpace').hide();
	$('#lightbox').fadeIn(200);
	$('#darkness').fadeIn(200);
});

$('.goBack').on('click', function(){
	$('#lightbox').fadeOut(200);
	$('#darkness').fadeOut(200);
	$('.buttonSpace').show();
	$('.regisForm').hide();
	$('.loginForm').hide();
});

$('#salir').on('click', function(){
	$.ajax({
		url: "/sessionDestroy"
	})
	.done(function(data){
		if(data){
			window.location.replace("/");
		}
	});
});

$('.return').on('click', function(){
	$('.datosPerfil').slideUp(300);
	$(this).parent().parent().slideUp(300);
	$('#mainDiv').slideDown(300);
});

$('#mostrarInformacion').on('click',function(){
	if(!$('.divInfo').is(':visible')){
		$('.datosPerfil').slideUp(300);
	}
	$('.divInfo').slideDown(300);
});

$('#historial').on('click', function(){
	if(!$('.historialMostrado').is(':visible')){
		$('.datosPerfil').slideUp(300);
	}
	$('.historialMostrado').slideDown(300);
	if($('.historialMostrado table tr').length <= 1){
		$.ajax({
			url: "/getPartidasPersonales"
		})
		.done(function(data){
			$.ajax({
				url: "/getThisUsername"
			})
			.done(function(data2){
				for(i in data){
					$('.historialMostrado table').append("<tr><td>"+data[i].id+"</td><td>"+data[i].jugadora+"</td><td>"+data[i].jugadorb+"</td><td>"+data[i].puntuaciona+"</td><td>"+data[i].puntuacionb+"</td></tr>");
					if(data[i].jugadora === data2){
						if(data[i].puntuaciona > data[i].puntuacionb){
							$('.historialMostrado table tr').last().addClass('win');
						} else if(data[i].puntuaciona < data[i].puntuacionb){
							$('.historialMostrado table tr').last().addClass('lose');
						} else {
							$('.historialMostrado table tr').last().addClass('eq');
						}
					} else if(data[i].jugadorb === data2){
						if(data[i].puntuaciona < data[i].puntuacionb){
							$('.historialMostrado table tr').last().addClass('win');
						} else if(data[i].puntuaciona > data[i].puntuacionb){
							$('.historialMostrado table tr').last().addClass('lose');
						} else {
							$('.historialMostrado table tr').last().addClass('eq');
						}
					}
				}
			});
		});
	}
});

$('.regisForm input[name="email"]').on('change', function(){
	if($(this).val() !== ""){
		$.ajax({
			url: "/checkIfUserExists/" + $(this).val()
		})
		.done(function(data){
			if(data[0] !== undefined){
				if(!$('.iconoRegMail').hasClass('iconoNeutro')){
					$('.iconoRegMail').removeClass('iconoValid');
					$('.iconoRegMail').removeClass('fa-check');
				} else {
					$('.iconoRegMail').removeClass('iconoNeutro');
					$('.iconoRegMail').removeClass('fa-minus');
				}
				$('.iconoRegMail').addClass('iconoError');
				$('.iconoRegMail').addClass('fa-times');
			} else {
				if(!$('.iconoRegMail').hasClass('iconoNeutro')){
					$('.iconoRegMail').removeClass('iconoError');
					$('.iconoRegMail').removeClass('fa-times');
				} else {
					$('.iconoRegMail').removeClass('iconoNeutro');
					$('.iconoRegMail').removeClass('fa-minus');
				}
				$('.iconoRegMail').addClass('iconoValid');
				$('.iconoRegMail').addClass('fa-check');
			}
		});
	}
});

$(document).on({
	ajaxStart: function(){
		$('body').addClass('loading');
	},
	ajaxStop: function(){
		$('body').removeClass('loading');
	}
});