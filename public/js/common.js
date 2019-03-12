var PORT = 3001;

$(".signupForm").submit(function(e) {
	e.preventDefault();

	var url = "http://localhost:"+ PORT +"/api/signup";

	$.ajax({
		url : url,
		method : "POST",
		dataType : "JSON",
		data : $(".signupForm").serializeArray(),
		success: function(res) {
			if (res.status == "error") {
				var html = "";
				$.each(res.errors, function(key, value) {
					html += "<p class='text-danger'>"+value+"</p>"; 
				});
				
				$("#err").empty().append(html);
			}else if(res.status == "success") {

				$("#err").empty().append("<div class='alert alert-success'>"+res.message+"</div>");
				
				$(".signupForm").trigger("reset");
			}
		}
	});
});

$(".loginForm").submit(function(e) {
	e.preventDefault();
	var url = "http://localhost:"+ PORT +"/api/login";

	$.ajax({
		url : url,
		method : "POST",
		dataType : "JSON",
		data : $(".loginForm").serializeArray(),
		success: function(res) {
			if (res.status == "error") {
				var html = "";
				$.each(res.errors, function(key, value) {		
					html += "<p class='text-danger'>"+value+"</p>"; 
				});
				$("#err").empty().append(html);
			}else if(res.status == "success") { 
				$("#err").empty().append("<div class='alert alert-success'>"+res.message+"</div>");
				$(".loginForm").trigger("reset");
				window.location.href = '/dashboard';
			}
		}
	});
});

$(document).ready(function() {

	function userData() { 
		var url = "http://localhost:"+ PORT +"/api/users";
		$.ajax({
			url : url,
			type : "GET",
			dataType : "JSON",
			success : function(response) {

				if (response.status == "success") {
					var userData = response.data; 
					var html = "";
					var counter = 1;
					$.each(userData, function(key, value) {
						html += "<tr>";
						html += "<td>"+counter+++"</td>";
						html += "<td>"+userData[key].name+"</td>";
						html += "<td>"+userData[key].email+"</td>"; 	
						html += "<td>";
						html += '<div class="input-group">';
						html += '<span class="input-group-addon minus" data-email="'+ userData
						[key].email +'" id=""><i class="glyphicon glyphicon-minus"></i></span>';
						html += '<input id="vote" type="text" disabled class="form-control" name="vote" value="' + userData[key].vote + '">';
						html += '<span class="input-group-addon plus" data-email="'+ userData
						[key].email +'" id=""><i class="glyphicon glyphicon-plus"></i></span>';
						html += '</div>';
						html += "</td>";
						html += "</tr>";
					});
					
					$("#userList tbody").empty().append(html);
				}else if (response.status == "error") {
					var html = "";

					html += "<tr>"; 
					html += "<td colspan='6'>"+ response.message +"</td>";
					html += "</tr>";
				
					$("#userList tbody").empty().append(html);
				}
			}
		});
	}

	// call on page load
	userData(); 
});

$(document).on("click",".plus", function() {  
	var vote = parseInt($(this).prev("#vote").val()) + 1; 
		vote = vote < 1 ? 0 : vote;	
	var url = "http://localhost:"+ PORT +"/api/vote";
	var email = $(this).data("email");
	$.ajax({
		url : url,
		type : "POST",
		dataType : "JSON",
		data : {email : email, vote : vote},
		success : function(response) {
			if (response.status == "success") {
				// location.reload();
			}
		}
	});

	$(this).prev("#vote").val(vote);
});

$(document).on("click",".minus", function() { 
	var vote = parseInt($(this).next("#vote").val()) - 1;
		vote = vote < 1 ? 0 : vote;
	var url = "http://localhost:"+ PORT +"/api/vote";
	var email = $(this).data("email");
	$.ajax({
		url : url,
		type : "POST",
		dataType : "JSON",
		data : {email : email, vote : vote},
		success : function(response) {
			if (response.status == "success") {
				// location.reload();
			}
		}
	});

	$(this).next("#vote").val(vote);
});

$(".logout").click(function() {
	var url = "http://localhost:"+ PORT +"/api/logout";
	$.ajax({
		url : url,
		type : "GET",
		dataType : "JSON", 
		success : function(response) {
			if (response.status == "success") {
				window.location.href = "/login";
			}
		}
	});
});