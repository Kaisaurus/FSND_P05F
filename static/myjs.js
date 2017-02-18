$('.filter_table').filterTable({minRows: 0});

$('.btn_select').on('click', function(e){
    e.preventDefault();
    $(this).toggleClass("btn_select_selected");
});
