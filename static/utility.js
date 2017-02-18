
function replaceImg(img, img_url, placeholder){
    $(img).one('error', function() {
        $(this).attr('src', placeholder);
    });
    img.attr('src', img_url);
}

function checkFieldContents(field, mark){
    if($.trim($(field).val()) != ""){
        return $(field).val()
    }else{
        if(mark == 1){
            $(field).parent().parent().addClass("has-error");
            return null
        }else if(mark == 0){
            return ""
        }
    }
}

function resetField(field){
    $(field).removeClass("has-error");
    $(field).val("");
}

function flashErrorMsg(msg){
    console.log("'Woops... something went wrong. ERROR: " + msg);
}

function flashMsg(msg){
    console.log(msg);
}

function removeElementByDataID(id, element, parent='body'){
    $(parent).find(element + "[data-id='"+ id +"']").remove();
}

// disable enter key on forms so default submit is not called
$(document).on("keypress", "form", function(event) {
    return event.keyCode != 13;
});