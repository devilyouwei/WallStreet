$(function(){
    $g_id = $("#good_id").text();
    init_data_paint($g_id,10);
    //获取商品数据，构建走势图
    $("#day_num").on("change",function(){
        let limit = $(this).val();
        init_data_paint($g_id,limit);
    });
});
//请求加载数据
function init_data_paint(g_id,limit){
    $.get("/futures/data/"+$g_id,function(res){
        if(res.status == 0){
            $(".right").html("<h1 class='am-text-danger'>"+res.msg+"</h1>")
        }else{
            var data = res.data;
            //初始化数据
            var open_price = [];
            var min_price = [];
            var max_price = [];
            var latest_price = [];
            var date = [];
            for(let i in data){
                if(data.length-i<limit)
                    continue;
                open_price.push(data[i].open_price);
                min_price.push(data[i].min_price);
                max_price.push(data[i].max_price);
                latest_price.push(data[i].latest_price);
                date.push(data[i].date);
            }
            var dom1=document.getElementById("paint-latest");
            var dom2=document.getElementById("paint-open");
            var dom3=document.getElementById("paint-max-min");
            paint_area_line(date,latest_price,dom1,"收盘价");
            paint_area_line(date,open_price,dom2,"开盘价");
            paint_line(date,[{title:"最低价",data:min_price},{title:"最高价",data:max_price}],dom3,"最低-最高价");
        }
    });
}

//绘制大数据曲线面积图
function paint_area_line(xdata,ydata,dom,title){

    let chart = echarts.init(dom,'light');

    option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: title,

        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xdata
        },
        yAxis: {
            type: 'value',
            scale:true,
        },
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 10
        }, {
            start: 0,
            end: 10,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }

        }],
    };

    option.series = [
        {
            name:title,
            type:'line',
            smooth:true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
                normal: {
                    color: 'rgb(255, 70, 131)'
                }

            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(255, 158, 68)'

                    }, {
                        offset: 1,
                        color: 'rgb(255, 70, 131)'
                    }])

                }
            },
            data: ydata
        }
    ]
    chart.setOption(option);
}

function paint_line(xdata,ydata,dom,title){

    let chart = echarts.init(dom,'light');
    option = {
        title: {
            text: title,
            left: 'center',
        },
        tooltip : {
            trigger: 'axis'
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data:xdata
            }
        ],
        yAxis : [
            {
                type : 'value',
                scale:true
            }

        ],
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 10

        }, {
            start: 0,
            end: 10,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2

            }

        }],
    };

    let legend_data = [];
    for(let y of ydata){
        legend_data.push(y.title);
    }

    option.legend={
        data:legend_data,
        left:"right"
    } 
    option.series = function(){
        let series = [];
        for(y of ydata){
            series.push({
                name:y.title,
                type:"line",
                data:y.data
            });
        }
        return series;
    }();
    chart.setOption(option);
}
