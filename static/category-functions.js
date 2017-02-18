
// edit category functionality
$('.btn_edit_category').on('click', function(e){
    var category_name = $(this).attr("data-name");
    flashMsg(category_name);
    $('#edit_category_name').val(category_name);
    $('#edit_category_title').html(category_name);
    $('#btn_edit_category_submit').attr('data-id', $(this).attr("data-id"));
});

$('#btn_edit_category_submit').on('click', function(e){
    e.preventDefault();
    submit_edit_category($(this).attr('data-id'));
});


function submit_edit_category(id){
    // Ajax call to send new item to the backend
    var category_name = checkFieldContents('#edit_category_name',1);
    if(category_name){
         $.ajax({
            data: JSON.stringify({name: category_name, id:id}),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/edit_category',
            success: function(response){
                updateCategoryDOM(category_name, id);
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

$('.btn_delete_category').on('click', function(e){
    var category_name = $(this).attr("data-name");
    $('#delete_category_text').html(category_name);
    $('#delete_category_title').html(category_name);
    $('#btn_delete_category_submit').attr('data-id', $(this).attr("data-id"));
});

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

$('#btn_new_category').on('click', function(e){
    e.preventDefault();
    submit_new_category();
});


function submit_new_category(){
    // Ajax call to send new item to the backend
    var category_name = checkFieldContents('#new_category_name',1);
    if(category_name){
         $.ajax({
            data: JSON.stringify({name: category_name}),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/new_category',
            success: function(response) {
                cloneCategoryItem(category_name, response.id);
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

function updateCategoryDOM(name, id){
    $('#tbody_category').find("a.btn_select[data-id='"+id+"']")
    .html(name)
    .attr('data-id', id)
    .attr('data-name', name);
    $('#tbody_category').find("a.btn_delete[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);
    $('#tbody_category').find("a.btn_edit[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);
}

function cloneCategoryItem(name, id){
    var item = $('#tbody_category').children(":first-child").clone(true,true);
    $('#tbody_category').children(":first-child").before(item)
    item.find(".btn_select").html(name);
    item.find('a').attr('data-id', id).attr('data-name', name);
    item.attr('data-id', id);
}