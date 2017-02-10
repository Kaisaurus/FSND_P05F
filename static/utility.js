function error_trying(subject){
  return 'Woops... something went wrong trying to '+subject+' this post, please try again later or notify the admin'
}

function checkContents(field){
    if($.trim($(field).val()) != ""){
        return $(field).val()
    }else{
        $(field).addClass("has-error");
        return null
    }
}

function resetField(field){
    $(field).removeClass("has-error");
    $(field).val();
}

function flashErrorMsg(msg){
    console.log("ERROR: " + msg);
}

function flashMsg(msg){
    console.log(msg);
}

