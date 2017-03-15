/*jshint esversion: 6 */
$(document).ready(function(){
    $('.btn_hide_parent').on('click',function(){
        $(this).parent().addClass('hidden');
    });
});

function replaceImg(img, img_url, placeholder){
    $(img).one('error', function() {
        $(this).attr('src', placeholder);
    });
    img.attr('src', img_url);
}

function checkFieldContents(field, mark){
    if($.trim($(field).val()) !== ""){
        return $(field).val();
    }else{
        if(mark == 1){
            $(field).parent().parent().addClass("has-error");
            return null;
        }else if(mark === 0){
            return "";
        }
    }
}

function resetField(field){
    $(field).removeClass("has-error");
    $(field).val("");
}

function flashErrorMsg(msg, errorFunction='undefined'){
    $('#block_msg').addClass('hidden');
    $('#block_error_msg').removeClass('hidden');
    $('#block_error_msg_text').html("Error in "+errorFunction+' function: "' + msg+'"');
    console.log("Error in "+errorFunction+' function: "' + msg+'"');
}

function flashMsg(msg){
    $('#block_error_msg').addClass('hidden');
    $('#block_msg').removeClass('hidden');
    $('#block_msg_text').html(msg);
    console.log(msg);
}

function removeElementByDataID(id, element, parent='body'){
    $(parent).find(element + "[data-id='"+ id +"']").remove();
}

// disable enter key on forms so default submit is not called
$(document).on("keypress", "form", function(event) {
    return event.keyCode != 13;
});