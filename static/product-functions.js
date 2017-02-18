// view product functionality
$('.btn_product').on('click', function(e){
    var product_id = $(this).attr("data-id");
    getProduct(product_id,'view');
});

function getProduct(product_id,type){
    $.ajax({
        type: 'GET',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: '/products/'+product_id+'/JSON',
        success: function(response){
            if(type == 'view'){
                var img_url = response.product.img_url;
                if(img_url){
                    $('#view_product_img').attr('src',img_url)
                }
                $('#view_product_title').html(response.product.name);
                $('#view_product_name').html(response.product.name);
                $('#view_product_description').html(response.product.description);
                $('#view_product_category').html(response.product.category);
                $('#modal_view_product').modal('show');
            }
            if(type == 'edit'){
                $('#edit_product_name').val(response.product.name);
                $('#edit_product_title').html(response.product.name);
                $('#edit_product_category').val(response.product.category);
                $('#edit_product_description').html(response.product.description);
                $('#edit_product_img_url').val(response.product.img_url);
                $('#btn_edit_product_submit').attr('data-id', product_id);
                $('#modal_edit_product').modal('show');
            }
        },
        error: function(error){
            flashErrorMsg(error.msg);
        }
    });
}

// edit product functionality
$('.btn_edit_product').on('click', function(e){
    var product_id = $(this).attr("data-id");
    getProduct(product_id,'edit');
});


$('#btn_edit_product_submit').on('click', function(e){
    e.preventDefault();
    submit_edit_product($(this).attr('data-id'));
});


function submit_edit_product(product_id){
    // Ajax call to send new item to the backend
    var product_name = checkFieldContents('#edit_product_name',1);
    var img_url = checkFieldContents('#edit_product_img_url',0);
    if(product_name){
        $.ajax({
            data: JSON.stringify({
                name: product_name,
                category: $('#edit_product_category').val(),
                description: checkFieldContents('#edit_product_description',0),
                id: product_id,
                img_url: img_url
                }),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/edit_product',
            success: function(response){
                updateProductDOM(product_name, product_id, img_url);
                $("#modal_edit_product").modal('hide');
                flashMsg(response.msg);

            },
            error: function(error){
                flashErrorMsg(error.msg);
            }
        });
    }
}

function updateProductDOM(name, id, img_url){
    $('#block_products').find("a.btn_product[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);
    $('#block_products').find(".product_title").html(name);
    $('#block_products').find("a.btn_delete[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);
    $('#block_products').find("a.btn_edit[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);

    img = $(".btn_product[data-id='"+id+"']").children(".product_img");
    replaceImg(img, img_url, 'http://placehold.it/100/CA386C/0000000');
}

// Delete product functionality

$('.btn_delete_product').on('click', function(e){
    var product_name = $(this).attr("data-name");
    $('#delete_product_text').html(product_name);
    $('#delete_product_title').html(product_name);
    $('#btn_delete_product_submit').attr('data-id', $(this).attr("data-id"));
});

$('#btn_delete_product_submit').on('click', function(e){
    e.preventDefault();
    submit_delete_product($(this).attr('data-id'));
});


function submit_delete_product(id){
    // Ajax call to send delete item to the backend
    $.ajax({
        data: JSON.stringify({id: id}),
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: '/delete_product',
        success: function(response) {
            removeElementByDataID(response.id, '.product_block', '#block_products');
            $("#modal_delete_product").modal('hide');
            flashMsg(response.msg);
        },
        error: function(error) {
            flashErrorMsg(error.msg);
        }
    });
}


// New product functionality

$('#btn_new_product_submit').on('click', function(e){
    e.preventDefault();
    submit_new_product();
});


function submit_new_product(){
    // Ajax call to send new item to the backend
    var product_name = checkFieldContents('#new_product_name',1);
    var img_url = checkFieldContents('#new_product_img_url',0)
    if(product_name){
        flashMsg($('#new_product_category').val());
        $.ajax({
            data: JSON.stringify({
                name: product_name,
                category: $('#new_product_category').val(),
                description: checkFieldContents('#new_product_description',0),
                img_url: img_url
                }),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: '/new_product',
            success: function(response) {
                cloneProductItem(product_name, response.id, img_url);
                $("#modal_new_product").modal('hide');
                resetField('#new_product_category');
                resetField('#new_product_description');
                resetField('#new_product_name');
                flashMsg(response.msg);
            },
            error: function(error) {
                flashErrorMsg(error.msg);
            }
        });
    }
}

function cloneProductItem(name, id, img_url){
    var item = $('#block_products').children(":nth-child(2)").clone(true,true);
    $('#block_products').children(":nth-child(2)").before(item)
    item.find(".product_title").html(name);
    item.find(".product_img").attr('src',checkImg(img_url));
    item.find('a').attr('data-id', id).attr('data-name', name);
    item.attr('data-id', id);
}