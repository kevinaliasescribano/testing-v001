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
					url: '/setSessionUser/'+email
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
		$.ajax({
			url: "/getRanking"
		})
		.done(function(data){
			for(i in data){
				$('#stats table').append("<tr><td>"+data[i].nombre+"</td><td>"+data[i].partidasjugadas+"</td><td>"+data[i].partidasganadas+"</td></tr>")
			}
		});
		
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
	$('#stats table td').parent().remove();
	$('#mainDiv').slideDown(300);
});