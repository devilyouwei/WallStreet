import pandas as pd
import numpy as np
import mysql.connector
import os
import json
import matplotlib.pyplot as plt
import tensorflow as tf

#——————————————————导入数据——————————————————————
price = []
try:
    with open("../dbconfig.json","r") as f:
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
data = data.astype("float32")
plt.plot(data)
plt.show()

#----------------深度学习训练参数------------------
#设置常量
input_step=30      #输入天数
output_step=30      #预测天数
rnn_unit=10      #神经元个数
batch_size=100     #每一批次训练多少个样例
input_size=1      #输入层维度
output_size=1     #输出层维度
lr=0.1         #学习率
training_iters=1000
keep_prob = tf.placeholder(tf.float32) #dropout

train_x,train_y=[],[]   #训练集
for i in range(len(data) - input_step-1):
    x=data[i:i+input_step]
    y=data[i+1:i+output_step+1]
    train_x.append(x.tolist())
    train_y.append(y.tolist()) 


#——————————————————定义神经网络变量——————————————————
X=tf.placeholder(tf.float32, [None,input_step,input_size])    #每批次输入网络的tensor
Y=tf.placeholder(tf.float32, [None,output_step,output_size])   #每批次tensor对应的标签
#输入层、输出层权重、偏置
weights={
         'in':tf.Variable(tf.random_normal([input_size,rnn_unit])),
         'out':tf.Variable(tf.random_normal([rnn_unit,1]))
         }
biases={
        'in':tf.Variable(tf.constant(0.1,shape=[rnn_unit,])),
        'out':tf.Variable(tf.constant(0.1,shape=[1,]))
        }

saver=tf.train.Saver()

#——————————————————定义神经网络变量——————————————————
def lstm(batch):      #参数：输入网络批次数目
    w_in=weights['in']
    b_in=biases['in']
    inputs=tf.reshape(X,[-1,input_size])  #需要将tensor转成2维进行计算，计算后的结果作为隐藏层的输入
    input_rnn=tf.matmul(inputs,w_in)+b_in
    input_rnn=tf.reshape(input_rnn,[-1,input_step,rnn_unit])  #将tensor转成3维，作为lstm cell的输入
    cell=tf.nn.rnn_cell.BasicLSTMCell(rnn_unit)
    init_state=cell.zero_state(batch,dtype=tf.float32)
    output_rnn,final_states=tf.nn.dynamic_rnn(cell, input_rnn,initial_state=init_state, dtype=tf.float32)  #output_rnn是记录lstm每个输出节点的结果，final_states是最后一个cell的结果
    output=tf.reshape(output_rnn,[-1,rnn_unit]) #作为输出层的输入
    w_out=weights['out']
    b_out=biases['out']
    pred=tf.matmul(output,w_out)+b_out
    pred = tf.nn.dropout(pred, keep_prob)
    return pred,final_states

#——————————————————训练模型——————————————————
def train_lstm():
    global batch_size
    pred,final_states=lstm(batch_size)
    #损失函数
    loss=tf.reduce_mean(tf.square(tf.reshape(pred,[-1])-tf.reshape(Y, [-1])))
    train_op=tf.train.AdamOptimizer(lr).minimize(loss)
    with tf.Session() as sess:
        sess.run(tf.global_variables_initializer())
        #重复训练10000次
        for i in range(training_iters):
            step=0
            start=0
            end=start+batch_size
            #100批，每批是30天训练
            while(end<len(train_x)):
                _,loss_=sess.run([train_op,loss],feed_dict={X:train_x[start:end],Y:train_y[start:end],keep_prob:0.99})
                start+=batch_size
                end=start+batch_size
                #每10步保存一次参数
                if step%10==0:
                    print("训练:",i,"损失:",loss_)
                    saver.save(sess,'./stock.model')
                step+=1


train_lstm()


#————————————————预测模型————————————————————
def prediction():
    pred,_=lstm(1)      #预测时只输入[1,time_step,input_size]的测试数据
    with tf.Session() as sess:
        #参数恢复
        module_file = tf.train.latest_checkpoint('./checkpoint')
        saver.restore(sess, module_file) 

        #取训练集最后一行为测试样本。shape=[1,time_step,input_size]
        prev_seq=train_x[-1]
        predict=[]
        for i in range(3):
            next_seq=sess.run(pred,feed_dict={X:[prev_seq]})
            #print(next_seq)
            #predict.append(next_seq[-1])
            #print(predict)

#prediction() 
