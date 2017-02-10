$('.filter_table').filterTable({minRows: 0});

//$('.money').autoNumeric('init');

$('#modal_category').on('shown.bs.modal', function () {
    $('#category_name').focus()
});

$('#modal_brand').on('shown.bs.modal', function () {
    $('#brand_name').focus()
});

$('#modal_item').on('shown.bs.modal', function () {
    $('#item_name').focus()
});

$('.btn_select').on('click', function(e){
    e.preventDefault();
    $(this).toggleClass("btn_select_selected");
});

// edit category functionality



$('#btn_edit_category_submit').on('click', function(e){
    e.preventDefault();
    submit_edit_category($(this).attr('data-id'));
});

$('#edit_category_form').keydown(function(e) {
    var key = e.which;
    if (key == 13) {
        e.preventDefault();
        submit_new_category();
    }
});

function submit_edit_category(id){
    // Ajax call to send new item to the backend
    var category_name = checkContents('#edit_category_name');
    if(category_name){
         $.ajax({
            data: JSON.stringify({name: category_name, id:id}),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/edit_category',
            success: function(response){
                editSelectableItem(category_name, id, '#tbody_category');
                $("#modal_edit_category").modal('hide');
                flashMsg(response.msg);
            },
            error: function(error){
                flashErrorMsg(error.msg);
            }
        });
    }
}

// Delete category functionality

$('#btn_delete_category_submit').on('click', function(e){
    e.preventDefault();
    submit_delete_category($(this).attr('data-id'));
});


function submit_delete_category(id){
    // Ajax call to send delete item to the backend
    $.ajax({
        data: JSON.stringify({id: id}),
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: '/delete_category',
        success: function(response) {
            removeElementByDataID(response.id, 'tr', '#tbody_category');
            $("#modal_delete_category").modal('hide');
            flashMsg(response.msg);
        },
        error: function(error) {
            flashErrorMsg(error.msg);
        }
    });
}


// New category functionality

$('#new_category_form').keydown(function(e) {
    var key = e.which;
    if (key == 13) {
        e.preventDefault();
        submit_new_category();
    }
});

$('#btn_new_category').on('click', function(e){
    e.preventDefault();
    submit_new_category();
});


function submit_new_category(){
    // Ajax call to send new item to the backend
    var category_name = checkContents('#new_category_name');
    if(category_name){
         $.ajax({
            data: JSON.stringify({name: category_name}),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/new_category',
            success: function(response) {
                addSelectableItem(category_name, response.id, '#tbody_category');
                $("#modal_new_category").modal('hide');
                resetField('#new_category_name');
                flashMsg(response.msg);
            },
            error: function(error) {
                flashErrorMsg(error.msg);
            }
        });
    }
}

// bind btn functionality for buttons which can be deleted / added

$('.btn_edit_category').on('click', function(e){
    var category_name = $(this).attr("data-name");
    flashMsg(category_name);
    $('#edit_category_name').val(category_name);
    $('#edit_category_title').html(category_name);
    $('#btn_edit_category_submit').attr('data-id', $(this).attr("data-id"));
});

$('.btn_delete_category').on('click', function(e){
    var category_name = $(this).attr("data-name");
    $('#delete_category_text').html(category_name);
    $('#delete_category_title').html(category_name);
    $('#btn_delete_category_submit').attr('data-id', $(this).attr("data-id"));

});


function editSelectableItem(name, id, parent){
    $(parent).find("a.btn_select[data-id='"+id+"']").html(name)
    .attr('data-id', id)
    .attr('data-name', name);
}

function addSelectableItem(name, id, parent){
    var item = $(parent).children(":first").clone(true,true).prependTo(parent);
    item.find(".btn_select").html(name);
    item.find('a').attr('data-id', id).attr('data-name', name);
    item.attr('data-id', id);
}

function removeElementByDataID(id, element, parent='body'){
    $(parent).find(element + "[data-id='"+ id +"']").remove();
}
