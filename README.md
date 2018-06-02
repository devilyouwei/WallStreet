# WallStreet(华尔街)
**爬取金融变化，进行风险预测，价格走势预测的大数据系统，中文名“华尔街”**

# 部署

## 基本工具
- MySQL数据库
- Node.js 9.0+
- python3
- pip3

## 安装
1. 将项目中wallstreet.sql导入MySQL数据库
（注意视图可能导致The user specified as a definer (”@’%') does not exist错误，详见博客：http://blog.handone.com/index.php/archives/137
2. 修改dbconfig.json配置数据库连接参数
3. 安装python项目所需基本库tensorflow，keras，pandas，pymysql，sklearn(已废弃)，matplotlib，tensorflowjs

# 后记和发展方向
1. 目前项目运行需要安装node.js和python，同时维护两门语言，过于繁杂，本人正在研究google最新发布的tensorflow.js，尝试使用JavaScript统一项目语言
2. 目前只对最高价进行深度学习，未来将考虑加入更多交易参数，学习过程将变复杂，预测结果将更有参考价值
3. 当前只能对期货进行爬虫和预测，未来将加入股票和电商网站实体商品
