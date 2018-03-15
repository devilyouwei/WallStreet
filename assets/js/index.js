// 获取选中的值
$(function() {
    var $radios = $('[name="c_id"]');
    $radios.on('change',function() {
        console.log('单选框当前选中的是：', $radios.filter(':checked').val());

    });

});
