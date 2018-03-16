$(function(){
    $g_id = $("#good_id").text();
    //获取商品数据，构建走势图
    $.get("/futures/data/"+$g_id,function(res){
        if(res.status == 0){
            $(".right").html("<h1 class='am-text-danger'>"+res.msg+"</h1>")
        }else{
            paint(res.data);
        }
    });
})

function paint(data){

    let chart = echarts.init(document.getElementById("paint"));
    var open_price = [];
    var min_price = [];
    var max_price = [];
    var latest_price = [];
    var date = [];

    for(let i in data){
        if(data.length-i>100)
            continue;
        open_price.push(data[i].open_price);
        min_price.push(data[i].min_price);
        max_price.push(data[i].max_price);
        latest_price.push(data[i].latest_price);
        date.push(data[i].date);
    }

    option = {
        title: {
            text: ''
        },
        legend: {
            data: ['开盘价', '最低价','最高价','最终价'],
            align: 'left'

        },
        toolbox: {
            feature: {
                magicType: {
                    type: ['stack', 'tiled']

                },
                dataView: {},
                saveAsImage: {
                    pixelRatio: 2

                }

            }
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: date,
            silent: true,
            splitLine: {
                show: true
            }
        },
        yAxis: {
            scale:true
        },
        series: [{
            name: '开盘价',
            type: 'line',
            smooth:true,
            data: open_price,
            animationDelay: function (idx) {
                return idx * 10;
            }

        }, {
            name: '最低价',
            type: 'line',
            smooth:true,
            data: min_price,
            animationDelay: function (idx) {
                return idx * 10 + 100;
            }

        },{
            name: '最高价',
            type: 'line',
            smooth:true,
            data: max_price,
            animationDelay: function (idx) {
                return idx * 10 + 200;
            }
        },{
            name: '最终价',
            type: 'line',
            data: latest_price,
            animationDelay: function (idx) {
                return idx * 10 + 300;
            }
        }],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
            return idx * 5;
        }

    };

    chart.setOption(option);
}
