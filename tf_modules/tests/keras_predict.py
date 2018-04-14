import numpy
import matplotlib.pyplot as plt
from pandas import read_csv
import math
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import mysql.connector
import os
import numpy as np
import json

#——————————————————导入数据——————————————————————
price = []
try:
    with open("../../dbconfig.json","r") as f:
        dbjson = json.load(f)
        cnn = mysql.connector.connect(**dbjson)
except mysql.connector.Error as e:
    print('connect failed!{}'.format(e))

cursor = cnn.cursor()

try:
    sql = 'select max_price from futures where g_id = 19 order by date asc;'
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

data = np.array(price)   #获取最高价序列
dataset = data.astype("float32")

#数据转换为矩阵
def create_dataset(dataset, window=1):
    dataX, dataY = [], []
    for i in range(len(dataset)-window-1):
        #窗口数据
        dataX.append(dataset[i:(i+window),0])
        #目标数据
        dataY.append(dataset[i + window, 0])
    return numpy.array(dataX), numpy.array(dataY)

#标准化数据,限制到0到1之间
scaler = MinMaxScaler(feature_range=(0, 1))
dataset = scaler.fit_transform(dataset)


#分解数据为训练数据和测试数据
train_size = int(len(dataset) * 0.6)
test_size = len(dataset) - train_size
train, test = dataset[0:train_size], dataset[train_size:len(dataset)]

#滑动窗口：输入值区间
window = 30
trainX, trainY = create_dataset(train, window)
testX, testY = create_dataset(test, window)

#数据格式化，lstm要求格式i[samples, time steps, features]
trainX = numpy.reshape(trainX, (len(trainX), 1, window))
testX = numpy.reshape(testX, (len(testX), 1, window))

# 创建RNN
model = Sequential()
model.add(LSTM(128, input_shape=(1, window)))
model.add(Dense(1))
model.compile(loss='mean_squared_error', optimizer='adam')
model.fit(trainX, trainY, epochs=100, batch_size=1, verbose=2)

# 预测
trainPredict = model.predict(trainX)
testPredict = model.predict(testX)

# 处理预测值
trainPredict = scaler.inverse_transform(trainPredict)
trainY = scaler.inverse_transform([trainY])
testPredict = scaler.inverse_transform(testPredict)
testY = scaler.inverse_transform([testY])

#评估模型
trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:,0]))
print('Train Score: %.2f RMSE' % (trainScore))
testScore = math.sqrt(mean_squared_error(testY[0], testPredict[:,0]))
print('Test Score: %.2f RMSE' % (testScore))

# shift train predictions for plotting
trainPredictPlot = numpy.empty_like(dataset)
trainPredictPlot[:, :] = numpy.nan
trainPredictPlot[window:len(trainPredict)+window, :] = trainPredict

# shift test predictions for plotting
testPredictPlot = numpy.empty_like(dataset)
testPredictPlot[:, :] = numpy.nan
testPredictPlot[len(trainPredict)+(window*2)+1:len(dataset)-1, :] = testPredict

# plot baseline and predictions
plt.plot(scaler.inverse_transform(dataset))
plt.plot(trainPredictPlot)
plt.plot(testPredictPlot)
plt.show()
