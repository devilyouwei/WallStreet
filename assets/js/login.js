/*
 * 前端：login.js
 * 登录界面
 * devilyouwei
 * 2018 3 9
 */
$(function(){
    document.onkeyup = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 13) {
            $(".am-form").submit();
        }

    };
    $(".am-form").on("submit",function(){
        $(".am-alert").remove();
        var post={
            username:$.trim($("#username").val()),
            password:$.trim($("#password").val())
        }

        var $form = $(this);
        var action = $form.attr("action");
        $.post(action,post,function(res){
            var alert = `
            <div class="am-alert am-alert-danger" data-am-alert>
                <button type="button" class="am-close">&times;</button>
                <p>${res.msg}</p>
            </div>
            `
            if(res.status==1){
                location.href="/admin";
            }else{
                $form.before(alert);
            }
        });
        return false;
    });
})
