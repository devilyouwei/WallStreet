import tensorflow as tf
import numpy as np

x = np.random.rand(100).astype(np.float32)
y = x*311.3+2.2

w = tf.Variable(tf.random_uniform([1],0.0,4.0))
b = tf.Variable(tf.zeros([1]))

y_pre = w*x+b

loss = tf.reduce_mean(tf.square(y_pre-y))
opt = tf.train.GradientDescentOptimizer(0.1)
train = opt.minimize(loss)

init = tf.initialize_all_variables()

session = tf.Session()

session.run(init)

for step in range(10000):
    session.run(train)
    if step % 100==0:
        print step,session.run(w),session.run(b)
