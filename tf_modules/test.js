'use strict';
 
const tf = require('tensorflow2');
const graph = tf.graph();
 
const x = graph.constant([[1, 2], [3, 4]], tf.dtype.float32, [2, 2]);
const w = graph.variable(x);
const y = graph.nn.softmax(graph.matmul(w, w));
 
const session = tf.session();
const res = session.run(y);
