$(function(){

    $(".sideMenu").slide({
        titCell:"h3", //鼠标触发对象
        targetCell:"ul", //与titCell一一对应，第n个titCell控制第n个targetCell的显示隐藏
        effect:"slideDown", //targetCell下拉效果
        delayTime:300 , //效果时间
        triggerTime:150, //鼠标延迟触发时间（默认150）
        defaultPlay:true,//默认是否执行效果（默认true）
        returnDefault:true //鼠标从.sideMen移走后返回默认状态（默认false）

    });

    $("#cate_add_form").on("submit",submit_add_form);
    $("#goods_add_form").on("submit",submit_add_form);
    $("#user_add_form").on("submit",submit_add_form);

    $(".del_cate_btn").on("click",del_func);
    $(".del_goods_btn").on("click",del_func);
    $(".del_user_btn").on("click",del_func);
})

//添加项
function submit_add_form(){
    let $form = $(this);
    let params=$form.serializeArray();
    let post = {};
    for(i in params)
        post[params[i].name] = params[i].value;

    let action = $form.attr("action");
    $.post(action,post,function(res){
        let alert = `<div class="am-alert am-alert-danger" data-am-alert> <button type="button" class="am-close">&times;</button> <p>${res.msg}</p> </div>`
        if(res.status==1){
            location.href=res.jump;
        }else{
            $form.prepend(alert);
        }
    });
    return false;
}
//删除项
function del_func(){
    let href = $(this).attr("href");
    $.get(href,function(res){
        if(res.status == 0){
            let alert = `<div class="am-alert am-alert-danger" data-am-alert> <button type="button" class="am-close">&times;</button> <p>${res.msg}</p> </div>`
            $(".am-panel-bd").append(alert);
        }else{
            location.href=res.jump;
        }
    });
}
