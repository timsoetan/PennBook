$(document).ready(function() {
	setMaxDate();
	
	clear("#signup-modal", "#signupform");
	
	clear("#login-modal", "#loginform");
});

/**
 * AJAX call to register a user on Pennbook
 */
function register() {
	$.post('/register', {
		firstname : $('#firstname').val(),
		lastname : $('#lastname').val(),
		email : $('#signupemail').val(),
		password : $('#signuppassword').val(),
		affiliation : $('#affiliation').val(),
		birthdate : $('#birthdate').val()
	}, function(response) {
		if (typeof (response) == 'string') {
			showSnackbar(response, "signupsnackbar")
		} else if (response == 301) {
			window.location = '/home'
		}
	});
};

/*
 * AJAX call to log in a user to Pennbook
 */
function login() {
	$.post('/login', {
		email : $('#loginemail').val(),
		password : $('#loginpassword').val()
	}, function(response) {
		if (typeof (response) == 'string') {
			showSnackbar(response, "loginsnackbar")
		} else if (response == 301)  {
			window.location = '/home'
		}
	});
};

/*
 * Resets modals on close
 */
function clear(modal, form) {
	$(modal).on('hidden.bs.modal', function() {
		$(this).find(form)[0].reset();
	});
}

/*
 * Sets todays date as the last date available when entering birthdate on signup
 * form
 */
function setMaxDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();

	if (dd < 10) {
		dd = '0' + dd
	} else if (mm < 10) {
		mm = '0' + mm
	}

	today = yyyy + '-' + mm + '-' + dd;
	document.getElementById("birthdate").setAttribute("max", today);
};

/*
 * Shows snackbar that displays mesages recieved from AJAX calls
 */
function showSnackbar(response, type) {
	var snackbar = document.getElementById(type);

	snackbar.className = "show";
	snackbar.innerHTML = response;

	setTimeout(function() {
		snackbar.className = snackbar.className.replace("show", "");
	}, 3000);
};