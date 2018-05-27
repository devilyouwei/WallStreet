import pymysql
import json
import numpy
#数据转换为矩阵
def create_dataset(dataset, window=1):
    dataX, dataY = [], []
    for i in range(len(dataset)-window-1):
        #窗口数据
        dataX.append(dataset[i:(i+window),0])
        #目标数据
        dataY.append(dataset[i + window, 0])

    return numpy.array(dataX), numpy.array(dataY)

def get_data(g_id):
    price = []
    try:
        with open("dbconfig.json","r") as f:
            dbjson = json.load(f)
            cnn = pymysql.Connect(**dbjson)
    except pymysql.Error as e:
        print('connect failed!{}'.format(e))

    cursor = cnn.cursor()

    try:
        sql = 'select max_price from futures where g_id = %s order by date asc;'%g_id

        cursor.execute(sql)
        for p in cursor:
            #去除当天未交易
            if p[0]==0:continue
            price.append(p)
    except mysql.connector.Error as e:
        print('query error!{}'.format(e))
    finally:
        cursor.close()
        cnn.close()

    data = numpy.array(price)   #获取最高价序列
    dataset = data.astype("float32")
    return dataset
