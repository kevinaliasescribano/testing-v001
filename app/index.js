$('#salir').on('click', function(){
	window.location.replace("/");
});

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
	$('.options').slideUp(300);
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