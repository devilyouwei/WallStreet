$(function(){
    let dom0=document.getElementById("paint-kline");
    let dom1=document.getElementById("paint-latest");
    let dom2=document.getElementById("paint-open");
    let dom3=document.getElementById("paint-max-min");
    let chart0 = echarts.init(dom0,'light');
    let chart1 = echarts.init(dom1,'light');
    let chart2 = echarts.init(dom2,'light');
    let chart3 = echarts.init(dom3,'light');
    let $chart_cate = $("#chart_cate");
    let $limit = $("#day_num");
    //g_id在同一個商品頁面中不變
    let $g_id = $("#good_id").text();
    let $g_name = $("h1.am-text-center").text();
    //默認檢索十天数据
    init_data_paint($g_id,10,$chart_cate.val());
    get_predict_data($g_id);
    //修改限制条数
    $limit.on("change",function(){
        init_data_paint($g_id,$limit.val(),$chart_cate.val());
    });
    //修改图类型
    $chart_cate.on("change",function(){
        init_data_paint($g_id,$limit.val(),$chart_cate.val());
    });

    async function get_predict_data(g_id){
        //深度学习预测
        let model = await tf.loadModel(`/tf_models/${g_id}/model.json`)
        let response = await fetch(`/futures/data/${g_id}/30`);
        let data = (await response.json()).data;
        let max_price = [];
        for(let i in data){
            max_price.push(data[i].max_price);
        }
        scaler = new min_max_scale(max_price);
        max_price = scaler.fit(max_price);
        let tf_price = tf.tensor3d(max_price,[1,1,30]);
        let prediction = model.predict(tf_price);
        let a = (await prediction.data())[0];
        a = scaler.inverse(a);

        $("#pre_data").text("预测值："+a);
        let now_data = $("#now_data").text();
        let percent = (a-now_data)/now_data
        $("#percent_size").text("涨幅比："+percent)
    }
    //老方法，交给后端python预测，已废弃，作为参考
    function get_predict_data_old(g_id){
        let url="/futures/predict/"+g_id;
        $.get(url,function(res){
            if(res.status){
                $("#pre_data").text("预测值："+res.data);
                let now_data = $("#now_data").text();
                let percent = (res.data-now_data)/now_data
                $("#percent_size").text("涨幅比："+percent)
            }else{
                alert(res.msg);
            }
        });
    }

    //对一维归一化
    function min_max_scale(data){
        this.max = Math.max(...data);
        this.min = Math.min(...data);
        this.fit = function(){
            for(i in data){
                data[i] = (data[i]-this.min)/(this.max-this.min);
            }
            return data;
        }
        this.inverse = (to_inverse) => to_inverse*(this.max-this.min)+this.min
        
    }
    //请求加载数据
    function init_data_paint(g_id,limit,chart){
        chart0.showLoading();
        chart1.showLoading();
        chart2.showLoading();
        chart3.showLoading();
        $.get("/futures/data/"+g_id+"/"+limit,function(res){
            chart0.hideLoading();
            chart1.hideLoading();
            chart2.hideLoading();
            chart3.hideLoading();
            if(res.status == 0){
                $(".right").html("<h1 class='am-text-danger'>"+res.msg+"</h1>")
            }else{
                let data = res.data;
                //初始化数据
                let open_price = [];
                let min_price = [];
                let max_price = [];
                let latest_price = [];
                let date = [];
                let volume = [];//交易量
                for(let i in data){
                    if(data[i].open_price==0 || data[i].min_price==0 || data[i].max_price==0 || data[i].latest_price==0 || data[i].volume==0)
                        continue;
                    open_price.push(data[i].open_price);
                    min_price.push(data[i].min_price);
                    max_price.push(data[i].max_price);
                    latest_price.push(data[i].latest_price);
                    date.push(data[i].date);
                    volume.push(data[i].volume);
                }
                $("#now_data").text(max_price[max_price.length-1]);
                //综合k线
                paint_kline(chart0,date,open_price,latest_price,min_price,max_price,$g_name);
                switch(chart){
                    case "area-line":
                        paint_area_line(date,latest_price,chart1,"收盘价");
                        paint_area_line(date,open_price,chart2,"开盘价");
                        break;
                    case "area-bar":
                        paint_area_bar(date,latest_price,chart1,"收盘价");
                        paint_area_bar(date,open_price,chart2,"开盘价");
                        break;
                    default:break;
                }
                //最低最高折线
                paint_line(date,[{title:"最低价",data:min_price},{title:"最高价",data:max_price},{title:"交易量",data:volume}],chart3,"最低-最高价");
            }
        });
    }

    //绘制大数据曲线面积图
    function paint_area_line(xdata,ydata,chart,title){
        let option = {
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
                end: 100
            }, {
                start: 0,
                end: 10,
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
        chart.clear();
        chart.setOption(option,true);
    }

    //柱状图
    function paint_area_bar(xdata,ydata,chart,title){
        let option = {
            title: {
                text: title
            },
            legend: {
                data: [title],
                align: 'right'
            },
            tooltip:{

            },
            xAxis: {
                data: xdata,
                silent: false,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                scale:true,
            },
            series: [{
                name: title,
                type: 'bar',
                data: ydata,
                animationDelay: function (idx) {
                    return idx * 10;
                }
            }],
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 5;
            }
        };
        chart.clear();
        chart.setOption(option,true);
    }

    //普通折线图
    function paint_line(xdata,ydata,chart,title){
        let option = {
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
                    scale:true,
                    data:xdata
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    name : '价位',
                    position:'left',
                    scale:true,
                },{
                    type:'value',
                    name:'交易量',
                    position:'right',
                    scale:true,
                }
            ],
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 10,
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
        option.series=[];
        option.series.push({
            name:ydata[0].title,
            type:"line",
            data:ydata[0].data
        });
        option.series.push({
            name:ydata[1].title,
            type:"line",
            data:ydata[1].data
        });
        option.series.push({
            name:ydata[2].title,
            type:"bar",
            barMaxWidth:20,
            yAxisIndex: 1,
            data:ydata[2].data,
            itemStyle:{
                opacity:0.5
            }
        });
        chart.clear();
        chart.setOption(option,true);
    }

    //k线图
    function paint_kline(chart,date,open,latest,min,max,title){
        //二维数组
        let data=[];
        for(let i in date){
            //开盘，收盘，最低，最高
            let data2=[open[i],latest[i],min[i],max[i]];
            data[i] = data2;
        }

        let option = {
            title : {
                text: title,
                left:"center",
            },
            tooltip : {
                trigger: 'axis',
                formatter: function (params) {
                    var res = params[0].seriesName + ' ' + params[0].name;
                    res += '<br/>  开盘 : ' + params[0].value[1] + '  最高 : ' + params[0].value[4];
                    res += '<br/>  收盘 : ' + params[0].value[2] + '  最低 : ' + params[0].value[3];
                    return res;
                }
            },
            legend: {
                data:[title],
                left:"right"
            },
            dataZoom : {
                show : true,
                realtime: true,
                start : 0,
                end : 100
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : true,
                    axisTick: {onGap:false},
                    splitLine: {show:false},
                    data : date
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    scale:true,
                    boundaryGap: [0.01, 0.01]
                }
            ],
            series : [
                {
                    name:title,
                    type:'k',
                    data: data// 开盘，收盘，最低，最高
                }
            ]
        };
        chart.clear();
        chart.setOption(option);
    }
});
