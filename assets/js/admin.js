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

    $("#cate_add_form").on("submit",function(){
        let post={
            name:$.trim($("#name").val()),
            api_name:$.trim($("#api_name").val()),
            api_url:$.trim($("#api_url").val())
        }
        let $form = $(this);
        let action = $form.attr("action");
        $.post("/admin/cate/add",post,function(res){
            var alert = `
            <div class="am-alert am-alert-danger" data-am-alert>
                <button type="button" class="am-close">&times;</button>
                <p>${res.msg}</p>
            </div>
            `
            if(res.status==1){
                location.href="/admin/cate/list";
            }else{
                $form.prepend(alert);
            }
        });
        return false;
    });
})
