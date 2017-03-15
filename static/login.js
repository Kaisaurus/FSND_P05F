function checkLogin(){
    refreshProducts();
    refreshCategories();
    if($('#section_logged_in').hasClass('hidden')){
        $('#section_not_logged_in').addClass('hidden');
        $('#section_logged_in').removeClass('hidden');
    }else{
        $('#section_not_logged_in').removeClass('hidden');
        $('#section_logged_in').addClass('hidden');
    }
}


$('#btn_logout').on('click',function(e){
    $.ajax({
        type: 'GET',
        url: '/disconnect',
        dataType: 'json',
        success: function(response){
            checkLogin();
            refreshProducts();
            flashMsg(response.msg);
        },
        error: function(response){
            flashErrorMsg(response.msg, 'logout');
        }
    });
});

function loginSuccessful(username, picture){
    $('#login_welcome').removeClass('hidden');
    $('#welcome_picture').attr('src',picture);
    $('#welcome_username').html(username);
    $('#login_btns').addClass('hidden');
    $('#nav_login_username').html(username);
    $('#nav_login_picture').attr('src',picture);
    checkLogin();
    setTimeout(function(){
        $('#modal_login').modal('hide');
    }, 3000);
    setTimeout(function(){
        $('#login_btns').removeClass('hidden');
        $('#login_welcome').addClass('hidden');
    }, 5000);
}

// Google OAuth2 login code
function signInCallback(authResult){
    if(authResult['code']){
        $('#signinButton').hide();
        $.ajax({
            type: 'POST',
            url: 'gconnect?state='+$('#btn_login').attr('data-state'),
            processData: false,
            contentType: 'application/octet-stream; charset=utf-8',
            data:authResult['code'],
            success:function(result){
                if(result){
                    loginSuccessful(result.username, result.picture);
                } else if(authResult['error']){
                    flashErrorMsg(authResult['error'], 'signInCallback autherror');
                } else {
                    flashErrorMsg('ERROR no server side call check config and console', 'signInCallback');
                }
            }

        });
    }
}
// Facebook OAuth2 login code
window.fbAsyncInit = function() {
    FB.init({
      appId      : '1649736768663631',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function sendTokenToServer() {
    var access_token = FB.getAuthResponse()['accessToken'];
    FB.api('/me', function(response) {
        flashMsg('Successful login for: ' + response.name);
        $.ajax({
            type: 'POST',
            url: '/fbconnect?state='+$('#btn_login').attr('data-state'),
            processData: false,
            data: access_token,
            contentType: 'application/octet-stream; charset=utf-8',
            success: function(result) {
            // Handle or verify the server response if necessary.
                if (result) {
                    loginSuccessful(result.username, result.picture);
                } else {
                    $('#result').html('Failed to make a server-side call. Check your configuration and console.');
                }
            }
        });
    });
}