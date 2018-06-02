import sys
import numpy
import math
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import myfunc as func
import tensorflowjs as tfjs

#传参获得商品id
g_id = sys.argv[1]
#——————————————————导入数据——————————————————————
dataset = func.get_data(g_id)


#标准化数据,限制到0到1之间
scaler = MinMaxScaler(feature_range=(0, 1))
dataset = scaler.fit_transform(dataset)


#滑动窗口构建：输入值区间
window = 30
trainX, trainY = func.create_dataset(dataset, window)

#数据格式化，lstm要求格式i[samples, time steps, features]
trainX = numpy.reshape(trainX, (len(trainX), 1, window))

# 创建RNN,并训练
model = Sequential()
model.add(LSTM(128, input_shape=(1, window)))
model.add(Dense(1))
model.compile(loss='mean_squared_error', optimizer='adam')
model.fit(trainX, trainY, epochs=100, batch_size=100, verbose=2)
#保存训练模型,第一种已废弃，作为参考
model.save('tf_modules/models/%s.h5'%g_id)
#将模型转换为tfjs可读，保存到express静态文件目录。
tfjs.converters.save_keras_model(model,'assets/tf_models/%s'%g_id)
