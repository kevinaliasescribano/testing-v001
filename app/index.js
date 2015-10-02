$('#botonPrueba').on('click', function(){
	var email = $('.loginForm input[name="mail"]').val();
	var pass = $('.loginForm input[name="pass"]').val();
	$.ajax({
		url: "/getUserByMail/"+email
	})
	.done(function(data){
		if(data[0] === undefined){
			alert("USUARIO O CONTRASEÑA NO VALIDOS");
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
				alert("USUARIO O CONTRASEÑA NO VALIDOS");
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
		
	}
	if($(this).attr('id') === "opcion2"){
		window.location.replace("/game");
	}
});

$('#makeRegis').on('click', function(){
	var id = $('.regisForm input[name="id"]').val();
	var nombre = $('.regisForm input[name="nombre"]').val();
	var email = $('.regisForm input[name="email"]').val();
	var password = $('.regisForm input[name="password"]').val();
	$.ajax({
		url: "/getUserByMail/"+email
	})
	.done(function(data){
		if(data[0] === undefined){
			$.ajax({
				url: "/postUser/"+id+"/"+nombre+"/"+email+"/"+password,
				data: {id: id, nombre: nombre, email: email, password: password}
			})
			.done(function(data){
				if(data === true){
					alert("USUARIO INSERTADO CORRECTAMENTE");
					window.location.reload();
				}
			});
		} else {
			$('.regisForm input[name="email"]').addClass('denegate');
		}
	});
	
});

$('#toLogin').on('click', function(){
	$('.buttonSpace').slideUp(300);
	$('.loginForm').slideDown(300);
});

$('#toRegis').on('click', function(){
	$('.buttonSpace').slideUp(300);
	$('.regisForm').slideDown(300);
});

$('.goBack').on('click', function(){
	$('.regisForm').slideUp(300);
	$('.loginForm').slideUp(300);
	$('.buttonSpace').slideDown(300);
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
	$(this).parent().parent().slideUp(300);
	$('#mainDiv').slideDown(300);
});

$(document).on({
	ajaxStart: function(){
		$('body').addClass('loading');
	},
	ajaxStop: function(){
		$('body').removeClass('loading');
	}
});