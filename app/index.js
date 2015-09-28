$('#botonPrueba').on('click', function(){
	$.ajax({
		url: "/getUsers"
	})
	.done(function(data){
		alert(data);
	});
});