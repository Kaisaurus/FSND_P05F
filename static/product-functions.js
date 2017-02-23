$(document).ready(function(){
    bindProductBlockFunctions();
    bindProductModalFunctions();
});

function bindProductBlockFunctions(){
    $('.btn_product').on('click', function(e){
        var product_id = $(this).attr("data-id");
        getProduct(product_id,'view');
    });

    $('.btn_edit_product').on('click', function(e){
        var product_id = $(this).attr("data-id");
        getProduct(product_id,'edit');
    });

    $('.btn_delete_product').on('click', function(e){
        var product_name = $(this).attr("data-name");
        $('#delete_product_text').html(product_name);
        $('#delete_product_title').html(product_name);
        $('#btn_delete_product_submit').attr('data-id', $(this).attr("data-id"));
    });

}

function bindProductModalFunctions(){
    $('#btn_new_category').on('click', function(e){
        e.preventDefault();
        submit_new_category();
    });

    $('#btn_edit_product_submit').on('click', function(e){
        e.preventDefault();
        submit_edit_product($(this).attr('data-id'));
    });

    $('#btn_delete_product_submit').on('click', function(e){
        e.preventDefault();
        submit_delete_product($(this).attr('data-id'));
    });

    $('#btn_new_product_submit').on('click', function(e){
        e.preventDefault();
        submit_new_product();
    });
}

function refreshProducts(){
    var selectedCategories = []
    if($(".btn_select_selected")){
        $(".btn_select_selected").each( function( index, element ){
            selectedCategories.push($( this ).attr('data-id'));
        });
    }
    $.ajax({
        type: 'GET',
        url: '/products?category_id='+selectedCategories.join(),
        success: function(response){
            $('#block_products_outer').html(response);
            bindProductBlockFunctions();
        },
        error: function(error){
            flashErrorMsg(error.msg, 'refreshProducts');
        }
    });
}

function getProduct(product_id,type){
    $.ajax({
        type: 'GET',
        dataType: "json",
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
                $('#edit_product_category').val(response.product.category_id);
                $('#edit_product_description').html(response.product.description);
                $('#edit_product_img_url').val(response.product.img_url);
                $('#btn_edit_product_submit').attr('data-id', product_id);
                $('#modal_edit_product').modal('show');
            }
        },
        error: function(error){
            flashErrorMsg(error.msg, 'getProduct');
        }
    });
}



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
                category_name = $('#edit_product_category option:selected' ).text();
                updateProductDOM(product_name, product_id, img_url, category_name);
                $("#modal_edit_product").modal('hide');
                flashMsg(response.msg);

            },
            error: function(error){
                flashErrorMsg(error.msg, 'submit_edit_product');
            }
        });
    }
}

function updateProductDOM(name, id, img_url, category){
    $("a.btn_product[data-id='"+id+"']")
    .attr('data-id', id)
    .attr('data-name', name);
    $("a.btn_product[data-id='"+id+"']").find('.product_title').html(name);
    $("a.btn_product[data-id='"+id+"']").find('.product_category').html('[ '+category+' ]');
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
            flashErrorMsg(error.msg, 'submit_delete_product');
        }
    });
}


// New product functionality

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
                category_name = $('#edit_product_category option:selected' ).text();
                //cloneProductItem(product_name, response.id, img_url, category_name);
                refreshProducts();
                $("#modal_new_product").modal('hide');
                resetField('#new_product_category');
                resetField('#new_product_description');
                resetField('#new_product_name');
                flashMsg(response.msg);
            },
            error: function(error) {
                flashErrorMsg(error.msg, 'submit_new_product');
            }
        });
    }
}

function cloneProductItem(name, id, img_url, category){
    var item = $('#block_products').children(":nth-child(2)").clone(true,true);
    $('#block_products').children(":nth-child(2)").before(item)
    item.find(".product_title").html(name);
    item.find('.product_category').html('[ '+category+' ]');
    img = item.find(".product_img");
    replaceImg(img, img_url, 'http://placehold.it/100/CA386C/0000000');
    item.find('a').attr('data-id', id).attr('data-name', name);
    item.attr('data-id', id);
}