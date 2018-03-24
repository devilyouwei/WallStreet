#!/usr/bin/python3
import tensorflow as tf
import os

v = tf.Variable(1000, name='my_variable')
sess = tf.Session()
tf.train.write_graph(sess.graph_def,'./','graph.pb',as_text=False)
