# 该文件已经被废弃，现在对数据的预测是在浏览器端tfjs实现的
from keras.models import load_model
import sys
import myfunc as func
from sklearn.preprocessing import MinMaxScaler
import numpy

g_id = sys.argv[1]
model = load_model('tf_modules/models/%s.h5'%g_id)
#获取最新的30条数据
dataset = func.get_data(g_id)
usedata = dataset[len(dataset)-30:len(dataset)]

window = 30

scaler = MinMaxScaler(feature_range=(0, 1))
usedata = scaler.fit_transform(usedata)


usedata = [usedata[0:30,0]]
usedata = numpy.array(usedata)
usedata = numpy.reshape(usedata,(len(usedata),1,window))

#预测
predict = model.predict(usedata)
predict = scaler.inverse_transform(predict)
print(predict[0][0])
