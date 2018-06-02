var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import { ones, scalar, sum, tensor1d, tensor2d, zeros } from '@tensorflow/tfjs-core';
import * as tfl from './index';
import { Reshape } from './layers/core';
import { deserialize } from './layers/serialization';
import { loadModelInternal, modelFromJSON } from './models';
import { convertPythonicToTs } from './utils/serialization_utils';
import { describeMathCPU, describeMathCPUAndGPU, expectTensorsClose } from './utils/test_utils';
import { version as layersVersion } from './version';
describeMathCPU('model_from_json', function () {
    it('reconstitutes pythonic json string', function (done) {
        modelFromJSON(fakeSequentialModel)
            .then(function (model) {
            expect(model.name).toEqual('test');
            var allZeros = zeros([1, 32]);
            expectTensorsClose(model.apply(allZeros), allZeros);
            done();
        })
            .catch(done.fail);
    });
    it('reconstitutes mnist non-sequential mode.', function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            modelFromJSON(fakeNonSequentialModel)
                .then(function (model) {
                expect(model.name).toEqual('mnist');
                expect(model.layers.length).toEqual(9);
                var prediction = model.predict(zeros([1, 28, 28, 1]));
                expect(prediction.shape).toEqual([1, 10]);
                expect(sum(prediction).dataSync()).toBeCloseTo(1);
                done();
            })
                .catch(done.fail);
            return [2];
        });
    }); });
    it('reconstitutes mnist sequential mode.', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            modelFromJSON(fakeMnistModel).then(function (model) { return __awaiter(_this, void 0, void 0, function () {
                var prediction;
                return __generator(this, function (_a) {
                    expect(model.layers.length).toEqual(8);
                    prediction = model.predict(zeros([1, 28, 28, 1]));
                    expect(prediction.shape).toEqual([1, 10]);
                    expect(sum(prediction).dataSync()).toBeCloseTo(1);
                    done();
                    return [2];
                });
            }); });
            return [2];
        });
    }); });
    it('Serialization round-tripping', function (done) {
        modelFromJSON(fakeRoundtripModel)
            .then(function (model) {
            var serializedModel = model.toJSON();
            expect(typeof serializedModel).toEqual('string');
            var reparsedJson = JSON.parse(serializedModel);
            expect(reparsedJson['class_name'])
                .toEqual(fakeRoundtripModel.modelTopology['class_name']);
            expect(reparsedJson['config'])
                .toEqual(fakeRoundtripModel.modelTopology['config']);
        })
            .then(done)
            .catch(done.fail);
    });
    it('toJSON with returnString = false', function (done) {
        modelFromJSON(fakeRoundtripModel)
            .then(function (model) {
            var serializedModel = model.toJSON(null, false);
            expect(serializedModel['class_name'])
                .toEqual(fakeRoundtripModel.modelTopology['class_name']);
            expect(serializedModel['config'])
                .toEqual(fakeRoundtripModel.modelTopology['config']);
        })
            .then(done)
            .catch(done.fail);
    });
    it('toJSON return value includes correct versions', function (done) {
        modelFromJSON(fakeRoundtripModel)
            .then(function (model) {
            var serializedModel = model.toJSON(null, false);
            expect(serializedModel['keras_version'])
                .toEqual("tfjs-layers " + layersVersion);
        })
            .then(done)
            .catch(done.fail);
    });
});
describeMathCPU('loadModel from URL', function () {
    var setupFakeWeightFiles = function (fileBufferMap) {
        spyOn(window, 'fetch').and.callFake(function (path) {
            return new Response(fileBufferMap[path]);
        });
    };
    var isModelConfigNestedValues = [false, true];
    var pathPrefixes = ['.', './', './model-home', './model-home/'];
    var _loop_1 = function (isModelConfigNested) {
        var _loop_2 = function (pathPrefix) {
            it("pathPrefix=" + pathPrefix, function (done) {
                var path0 = pathPrefix.endsWith('/') ? pathPrefix + "weight_0" :
                    pathPrefix + "/weight_0";
                var path1 = pathPrefix.endsWith('/') ? pathPrefix + "weight_1" :
                    pathPrefix + "/weight_1";
                var fileBufferMap = {};
                fileBufferMap[path0] =
                    ones([32, 32], 'float32').dataSync();
                fileBufferMap[path1] = ones([32], 'float32').dataSync();
                setupFakeWeightFiles(fileBufferMap);
                var denseLayerName = 'dense_' + Math.floor(Math.random() * 1e9);
                var weightsManifest = [
                    {
                        'paths': ['weight_0'],
                        'weights': [{
                                'name': denseLayerName + "/kernel",
                                'dtype': 'float32',
                                'shape': [32, 32]
                            }],
                    },
                    {
                        'paths': ['weight_1'],
                        'weights': [{
                                'name': denseLayerName + "/bias",
                                'dtype': 'float32',
                                'shape': [32]
                            }],
                    }
                ];
                var modelTopology = JSON.parse(JSON.stringify(fakeSequentialModel)).modelTopology;
                modelTopology['config']['layers'][1]['config']['name'] = denseLayerName;
                if (isModelConfigNested) {
                    modelTopology = { 'model_config': modelTopology };
                }
                modelFromJSON({ modelTopology: modelTopology, weightsManifest: weightsManifest, pathPrefix: pathPrefix })
                    .then(function (model) {
                    expectTensorsClose(model.weights[0].read(), ones([32, 32], 'float32'));
                    expectTensorsClose(model.weights[1].read(), ones([32], 'float32'));
                })
                    .then(done)
                    .catch(done.fail);
            });
        };
        for (var _i = 0, pathPrefixes_1 = pathPrefixes; _i < pathPrefixes_1.length; _i++) {
            var pathPrefix = pathPrefixes_1[_i];
            _loop_2(pathPrefix);
        }
    };
    for (var _i = 0, isModelConfigNestedValues_1 = isModelConfigNestedValues; _i < isModelConfigNestedValues_1.length; _i++) {
        var isModelConfigNested = isModelConfigNestedValues_1[_i];
        _loop_1(isModelConfigNested);
    }
    it('Missing weight in manifest leads to error', function (done) {
        setupFakeWeightFiles({
            './weight_0': ones([32, 32], 'float32').dataSync(),
            './weight_1': ones([32], 'float32').dataSync(),
        });
        var denseLayerName = 'dense_' + Math.floor(Math.random() * 1e9);
        var weightsManifest = [
            {
                'paths': ['weight_0'],
                'weights': [{
                        'name': denseLayerName + "/kernel",
                        'dtype': 'float32',
                        'shape': [32, 32]
                    }],
            },
        ];
        var configJson = JSON.parse(JSON.stringify(fakeSequentialModel)).modelTopology;
        configJson['config']['layers'][1]['config']['name'] = denseLayerName;
        modelFromJSON({ modelTopology: configJson, weightsManifest: weightsManifest, pathPrefix: '.' })
            .then(function () { return done.fail; })
            .catch(done);
    });
    it('Loads weights despite uniqueified tensor names', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var denseLayerName, weightsManifest, configJson, model1, model2, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    setupFakeWeightFiles({
                        './weight_0': ones([32, 32], 'float32').dataSync(),
                        './weight_1': ones([32], 'float32').dataSync(),
                    });
                    denseLayerName = 'dense_uniqueify';
                    weightsManifest = [
                        {
                            'paths': ['weight_0'],
                            'weights': [{
                                    'name': denseLayerName + "/kernel",
                                    'dtype': 'float32',
                                    'shape': [32, 32]
                                }],
                        },
                        {
                            'paths': ['weight_1'],
                            'weights': [{
                                    'name': denseLayerName + "/bias",
                                    'dtype': 'float32',
                                    'shape': [32]
                                }],
                        }
                    ];
                    configJson = JSON.parse(JSON.stringify(fakeSequentialModel)).modelTopology;
                    configJson['config']['layers'][1]['config']['name'] = denseLayerName;
                    return [4, modelFromJSON({ modelTopology: configJson, weightsManifest: weightsManifest, pathPrefix: '.' })];
                case 1:
                    model1 = _a.sent();
                    expect(model1.weights[0].name).toEqual('dense_uniqueify/kernel');
                    expect(model1.weights[0].originalName).toEqual('dense_uniqueify/kernel');
                    expect(model1.weights[1].name).toEqual('dense_uniqueify/bias');
                    expect(model1.weights[1].originalName).toEqual('dense_uniqueify/bias');
                    expectTensorsClose(model1.weights[0].read(), ones([32, 32], 'float32'));
                    expectTensorsClose(model1.weights[1].read(), ones([32], 'float32'));
                    return [4, modelFromJSON({ modelTopology: configJson, weightsManifest: weightsManifest, pathPrefix: '.' })];
                case 2:
                    model2 = _a.sent();
                    expect(model2.weights[0].name).toEqual('dense_uniqueify/kernel_1');
                    expect(model2.weights[0].originalName).toEqual('dense_uniqueify/kernel');
                    expect(model2.weights[1].name).toEqual('dense_uniqueify/bias_1');
                    expect(model2.weights[1].originalName).toEqual('dense_uniqueify/bias');
                    expectTensorsClose(model2.weights[0].read(), ones([32, 32], 'float32'));
                    expectTensorsClose(model2.weights[1].read(), ones([32], 'float32'));
                    done();
                    return [3, 4];
                case 3:
                    e_1 = _a.sent();
                    done.fail(e_1.stack);
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    it('Repeated saving and loading of Model works', function () {
        var model1 = tfl.sequential();
        model1.add(tfl.layers.dense({ units: 3, inputShape: [4], activation: 'relu' }));
        model1.add(tfl.layers.dense({ units: 1, inputShape: [4], activation: 'sigmoid' }));
        var json1 = model1.toJSON(null, false);
        var model2 = deserialize(convertPythonicToTs(json1));
        var json2 = model2.toJSON(null, false);
        expect(json2).toEqual(json1);
    });
});
describeMathCPU('loadModel from IOHandler', function () {
    var modelTopology = {
        'class_name': 'Sequential',
        'keras_version': '2.1.4',
        'config': [{
                'class_name': 'Dense',
                'config': {
                    'kernel_initializer': {
                        'class_name': 'VarianceScaling',
                        'config': {
                            'distribution': 'uniform',
                            'scale': 1.0,
                            'seed': null,
                            'mode': 'fan_avg'
                        }
                    },
                    'name': 'dense_1',
                    'kernel_constraint': null,
                    'bias_regularizer': null,
                    'bias_constraint': null,
                    'dtype': 'float32',
                    'activation': 'sigmoid',
                    'trainable': true,
                    'kernel_regularizer': null,
                    'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                    'units': 1,
                    'batch_input_shape': [null, 4],
                    'use_bias': true,
                    'activity_regularizer': null
                }
            }],
        'backend': 'tensorflow'
    };
    var weightSpecs = [
        {
            name: 'dense_1/kernel',
            shape: [4, 1],
            dtype: 'float32',
        },
        {
            name: 'dense_1/bias',
            shape: [1],
            dtype: 'float32',
        }
    ];
    var weightData = new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]).buffer;
    var IOHandlerForTest = (function () {
        function IOHandlerForTest(includeWeights) {
            if (includeWeights === void 0) { includeWeights = true; }
            this.includeWeights = includeWeights;
        }
        IOHandlerForTest.prototype.load = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.includeWeights ? { modelTopology: modelTopology, weightSpecs: weightSpecs, weightData: weightData } :
                            { modelTopology: modelTopology }];
                });
            });
        };
        return IOHandlerForTest;
    }());
    var IOHandlerWithoutLoad = (function () {
        function IOHandlerWithoutLoad() {
        }
        return IOHandlerWithoutLoad;
    }());
    it('load topology and weights', function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            loadModelInternal(new IOHandlerForTest(true))
                .then(function (model) {
                expect(model.layers.length).toEqual(1);
                expect(model.inputs.length).toEqual(1);
                expect(model.inputs[0].shape).toEqual([null, 4]);
                expect(model.outputs.length).toEqual(1);
                expect(model.outputs[0].shape).toEqual([null, 1]);
                var weightValues = model.getWeights();
                expect(weightValues.length).toEqual(2);
                expectTensorsClose(weightValues[0], tensor2d([1.1, 2.2, 3.3, 4.4], [4, 1]));
                expectTensorsClose(weightValues[1], tensor1d([5.5]));
                done();
            })
                .catch(function (err) {
                done.fail(err.stack);
            });
            return [2];
        });
    }); });
    it('load topology only', function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            loadModelInternal(new IOHandlerForTest(false))
                .then(function (model) {
                expect(model.layers.length).toEqual(1);
                expect(model.inputs.length).toEqual(1);
                expect(model.inputs[0].shape).toEqual([null, 4]);
                expect(model.outputs.length).toEqual(1);
                expect(model.outputs[0].shape).toEqual([null, 1]);
                done();
            })
                .catch(function (err) {
                done.fail(err.stack);
            });
            return [2];
        });
    }); });
    it('IOHandler without load method causes error', function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            loadModelInternal(new IOHandlerWithoutLoad())
                .then(function (model) {
                done.fail('Loading with an IOHandler without load method succeeded ' +
                    'unexpectedly.');
            })
                .catch(function (err) {
                expect(err.message).toMatch(/does not have .*load.* method/);
                done();
            });
            return [2];
        });
    }); });
});
describeMathCPUAndGPU('Sequential', function () {
    var inputShape = [1, 6];
    var batchInputShape = [1].concat(inputShape);
    var firstReshape = [2, 3];
    var secondReshape = [3, 2];
    var layers = [
        new Reshape({ targetShape: firstReshape, batchInputShape: batchInputShape, name: 'layer1' }),
        new Reshape({ targetShape: secondReshape, name: 'layer2' })
    ];
    function getInputs() {
        return ones(batchInputShape);
    }
    function getExpectedOutputs() {
        return ones([1].concat(secondReshape));
    }
    it('throws an exception if the first layer is not an input layer', function () {
        var layer = new Reshape({ targetShape: firstReshape });
        expect(function () { return tfl.sequential({ layers: [layer] }); })
            .toThrowError(/The first layer in a Sequential model must get an `inputShape`/);
    });
    it('can accept a list of layers in constructor', function () {
        var model = tfl.sequential({ layers: layers });
        expect(model.layers).toEqual(layers);
    });
    it('can add layers', function () {
        var model = tfl.sequential();
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            model.add(layer);
        }
        expect(model.layers).toEqual(layers);
    });
    it('can pop layers', function () {
        var model = tfl.sequential({ layers: layers });
        model.pop();
        expect(model.layers).toEqual(layers.slice(0, 1));
    });
    it('throws error if try to pop too many layers', function () {
        var model = tfl.sequential();
        expect(function () { return model.pop(); }).toThrowError(/There are no layers in the model/);
    });
    it('apply() threads data through the model.', function () {
        var model = tfl.sequential({ layers: layers });
        expectTensorsClose(model.apply(getInputs()), getExpectedOutputs());
    });
    it('predict() threads data through the model.', function () {
        var model = tfl.sequential({ layers: layers });
        expectTensorsClose(model.predict(getInputs()), getExpectedOutputs());
    });
    it('predictOnBatch() threads data through the model.', function () {
        var batchSize = 10;
        var inputShape = [1, 6];
        var batchInputShape = [batchSize].concat(inputShape);
        var firstReshape = [2, 3];
        var secondReshape = [3, 2];
        var layers = [
            new Reshape({ targetShape: firstReshape, batchInputShape: batchInputShape, name: 'layer1' }),
            new Reshape({ targetShape: secondReshape, name: 'layer2' })
        ];
        var inputBatch = ones([batchSize].concat(inputShape));
        var expectedOutput = ones([batchSize].concat(secondReshape));
        var model = tfl.sequential({ layers: layers });
        expectTensorsClose(model.predictOnBatch(inputBatch), expectedOutput);
    });
    it('compile() and fit()', function () { return __awaiter(_this, void 0, void 0, function () {
        var batchSize, inputSize, xs, ys, denseLayer1, denseLayer2, model, history;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batchSize = 5;
                    inputSize = 4;
                    xs = ones([batchSize, inputSize]);
                    ys = ones([batchSize, 1]);
                    denseLayer1 = tfl.layers.dense({
                        units: 3,
                        useBias: false,
                        kernelInitializer: 'ones',
                        inputShape: [inputSize]
                    });
                    denseLayer2 = tfl.layers.dense({ units: 1, useBias: false, kernelInitializer: 'ones' });
                    model = tfl.sequential({ layers: [denseLayer1, denseLayer2] });
                    model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
                    return [4, model.fit(xs, ys, { batchSize: batchSize, epochs: 2 })];
                case 1:
                    history = _a.sent();
                    expectTensorsClose(history.history['loss'][0], scalar(121));
                    expectTensorsClose(history.history['loss'][1], scalar(0.015178224071860313));
                    return [2];
            }
        });
    }); });
    it('Calling evaluate before compile leads to error', function () {
        var batchSize = 5;
        var inputSize = 4;
        var denseLayer1 = tfl.layers.dense({ units: 3, inputShape: [inputSize] });
        var model = tfl.sequential({ layers: [denseLayer1] });
        var xs = ones([batchSize, inputSize]);
        var ys = ones([batchSize, 1]);
        expect(function () { return model.evaluate(xs, ys); })
            .toThrowError(/needs to be compiled before/);
    });
    it('compile() and evaluate()', function () {
        var batchSize = 5;
        var inputSize = 4;
        var xs = ones([batchSize, inputSize]);
        var ys = ones([batchSize, 1]);
        var denseLayer1 = tfl.layers.dense({
            units: 3,
            useBias: false,
            kernelInitializer: 'ones',
            inputShape: [inputSize]
        });
        var denseLayer2 = tfl.layers.dense({ units: 1, useBias: false, kernelInitializer: 'ones' });
        var model = tfl.sequential({ layers: [denseLayer1, denseLayer2] });
        model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
        var losses = model.evaluate(xs, ys, { batchSize: batchSize });
        expectTensorsClose(losses, scalar(121));
    });
    it('getConfig returns an Array', function () {
        var model = tfl.sequential({ layers: layers });
        var config = model.getConfig();
        expect(Array.isArray(config)).toEqual(true);
        expect(config.length).toEqual(layers.length);
    });
});
var fakeSequentialModel = {
    modelTopology: {
        'class_name': 'Model',
        'keras_version': '2.0.7',
        'config': {
            'layers': [
                {
                    'class_name': 'InputLayer',
                    'config': {
                        'dtype': 'float32',
                        'batch_input_shape': [null, 32],
                        'name': 'input_6',
                        'sparse': false
                    },
                    'inbound_nodes': [],
                    'name': 'input_6'
                },
                {
                    'class_name': 'Dense',
                    'config': {
                        'units': 32,
                        'bias_constraint': null,
                        'use_bias': true,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1,
                                'seed': null,
                                'mode': 'fan_avg'
                            }
                        },
                        'activation': 'linear',
                        'bias_regularizer': null,
                        'activity_regularizer': null,
                        'trainable': true,
                        'kernel_constraint': null,
                        'kernel_regularizer': null,
                        'name': 'dense_6',
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} }
                    },
                    'inbound_nodes': [[['input_6', 0, 0, {}]]],
                    'name': 'dense_6'
                }
            ],
            'input_layers': [['input_6', 0, 0]],
            'output_layers': [['dense_6', 0, 0]],
            'name': 'test'
        },
        'backend': 'tensorflow'
    }
};
var fakeNonSequentialModel = {
    modelTopology: {
        'backend': 'tensorflow',
        'class_name': 'Model',
        'keras_version': '2.1.1',
        'config': {
            'name': 'mnist',
            'output_layers': [['dense_16', 0, 0]],
            'layers': [
                {
                    'class_name': 'InputLayer',
                    'name': 'input_6',
                    'inbound_nodes': [],
                    'config': {
                        'batch_input_shape': [null, 28, 28, 1],
                        'sparse': false,
                        'name': 'input_6',
                        'dtype': 'float32'
                    }
                },
                {
                    'class_name': 'Conv2D',
                    'name': 'conv2d_15',
                    'inbound_nodes': [[['input_6', 0, 0, {}]]],
                    'config': {
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'padding': 'valid',
                        'use_bias': true,
                        'strides': [1, 1],
                        'bias_regularizer': null,
                        'activity_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'data_format': 'channels_last',
                        'dilation_rate': [1, 1],
                        'kernel_constraint': null,
                        'kernel_regularizer': null,
                        'kernel_size': [3, 3],
                        'activation': 'relu',
                        'name': 'conv2d_15',
                        'filters': 32,
                        'trainable': true,
                        'bias_constraint': null
                    }
                },
                {
                    'class_name': 'Conv2D',
                    'name': 'conv2d_16',
                    'inbound_nodes': [[['conv2d_15', 0, 0, {}]]],
                    'config': {
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'padding': 'valid',
                        'use_bias': true,
                        'strides': [1, 1],
                        'bias_regularizer': null,
                        'activity_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'data_format': 'channels_last',
                        'dilation_rate': [1, 1],
                        'kernel_constraint': null,
                        'kernel_regularizer': null,
                        'kernel_size': [3, 3],
                        'activation': 'relu',
                        'name': 'conv2d_16',
                        'filters': 64,
                        'trainable': true,
                        'bias_constraint': null
                    }
                },
                {
                    'class_name': 'MaxPooling2D',
                    'name': 'max_pooling2d_8',
                    'inbound_nodes': [[['conv2d_16', 0, 0, {}]]],
                    'config': {
                        'padding': 'valid',
                        'strides': [2, 2],
                        'pool_size': [2, 2],
                        'data_format': 'channels_last',
                        'name': 'max_pooling2d_8',
                        'trainable': true
                    }
                },
                {
                    'class_name': 'Dropout',
                    'name': 'dropout_15',
                    'inbound_nodes': [[['max_pooling2d_8', 0, 0, {}]]],
                    'config': {
                        'rate': 0.25,
                        'noise_shape': null,
                        'name': 'dropout_15',
                        'trainable': true,
                        'seed': null
                    }
                },
                {
                    'class_name': 'Flatten',
                    'name': 'flatten_8',
                    'inbound_nodes': [[['dropout_15', 0, 0, {}]]],
                    'config': { 'name': 'flatten_8', 'trainable': true }
                },
                {
                    'class_name': 'Dense',
                    'name': 'dense_15',
                    'inbound_nodes': [[['flatten_8', 0, 0, {}]]],
                    'config': {
                        'use_bias': true,
                        'bias_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'kernel_constraint': null,
                        'bias_constraint': null,
                        'kernel_regularizer': null,
                        'activation': 'relu',
                        'name': 'dense_15',
                        'activity_regularizer': null,
                        'trainable': true,
                        'units': 128
                    }
                },
                {
                    'class_name': 'Dropout',
                    'name': 'dropout_16',
                    'inbound_nodes': [[['dense_15', 0, 0, {}]]],
                    'config': {
                        'rate': 0.5,
                        'noise_shape': null,
                        'name': 'dropout_16',
                        'trainable': true,
                        'seed': null
                    }
                },
                {
                    'class_name': 'Dense',
                    'name': 'dense_16',
                    'inbound_nodes': [[['dropout_16', 0, 0, {}]]],
                    'config': {
                        'use_bias': true,
                        'bias_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'kernel_constraint': null,
                        'bias_constraint': null,
                        'kernel_regularizer': null,
                        'activation': 'softmax',
                        'name': 'dense_16',
                        'activity_regularizer': null,
                        'trainable': true,
                        'units': 10
                    }
                }
            ],
            'input_layers': [['input_6', 0, 0]]
        }
    }
};
var fakeMnistModel = {
    modelTopology: {
        'backend': 'tensorflow',
        'config': [
            {
                'config': {
                    'kernel_size': [3, 3],
                    'use_bias': true,
                    'batch_input_shape': [null, 28, 28, 1],
                    'filters': 32,
                    'kernel_regularizer': null,
                    'dilation_rate': [1, 1],
                    'strides': [1, 1],
                    'padding': 'valid',
                    'bias_constraint': null,
                    'kernel_constraint': null,
                    'data_format': 'channels_last',
                    'trainable': true,
                    'activation': 'relu',
                    'dtype': 'float32',
                    'bias_initializer': { 'config': {}, 'class_name': 'Zeros' },
                    'bias_regularizer': null,
                    'name': 'conv2d_1',
                    'kernel_initializer': {
                        'config': {
                            'scale': 1.0,
                            'mode': 'fan_avg',
                            'seed': null,
                            'distribution': 'uniform'
                        },
                        'class_name': 'VarianceScaling'
                    },
                    'activity_regularizer': null
                },
                'class_name': 'Conv2D'
            },
            {
                'config': {
                    'kernel_size': [3, 3],
                    'use_bias': true,
                    'filters': 64,
                    'kernel_regularizer': null,
                    'dilation_rate': [1, 1],
                    'strides': [1, 1],
                    'padding': 'valid',
                    'bias_constraint': null,
                    'data_format': 'channels_last',
                    'trainable': true,
                    'activation': 'relu',
                    'kernel_constraint': null,
                    'bias_initializer': { 'config': {}, 'class_name': 'Zeros' },
                    'bias_regularizer': null,
                    'name': 'conv2d_2',
                    'kernel_initializer': {
                        'config': {
                            'scale': 1.0,
                            'mode': 'fan_avg',
                            'seed': null,
                            'distribution': 'uniform'
                        },
                        'class_name': 'VarianceScaling'
                    },
                    'activity_regularizer': null
                },
                'class_name': 'Conv2D'
            },
            {
                'config': {
                    'strides': [2, 2],
                    'padding': 'valid',
                    'pool_size': [2, 2],
                    'data_format': 'channels_last',
                    'trainable': true,
                    'name': 'max_pooling2d_1'
                },
                'class_name': 'MaxPooling2D'
            },
            {
                'config': {
                    'seed': null,
                    'name': 'dropout_1',
                    'trainable': true,
                    'noise_shape': null,
                    'rate': 0.25
                },
                'class_name': 'Dropout'
            },
            {
                'config': { 'name': 'flatten_1', 'trainable': true },
                'class_name': 'Flatten'
            },
            {
                'config': {
                    'use_bias': true,
                    'units': 128,
                    'bias_initializer': { 'config': {}, 'class_name': 'Zeros' },
                    'kernel_regularizer': null,
                    'bias_regularizer': null,
                    'trainable': true,
                    'activation': 'relu',
                    'bias_constraint': null,
                    'kernel_constraint': null,
                    'name': 'dense_1',
                    'kernel_initializer': {
                        'config': {
                            'scale': 1.0,
                            'mode': 'fan_avg',
                            'seed': null,
                            'distribution': 'uniform'
                        },
                        'class_name': 'VarianceScaling'
                    },
                    'activity_regularizer': null
                },
                'class_name': 'Dense'
            },
            {
                'config': {
                    'seed': null,
                    'name': 'dropout_2',
                    'trainable': true,
                    'noise_shape': null,
                    'rate': 0.5
                },
                'class_name': 'Dropout'
            },
            {
                'config': {
                    'use_bias': true,
                    'units': 10,
                    'bias_initializer': { 'config': {}, 'class_name': 'Zeros' },
                    'kernel_regularizer': null,
                    'bias_regularizer': null,
                    'trainable': true,
                    'activation': 'softmax',
                    'bias_constraint': null,
                    'kernel_constraint': null,
                    'name': 'dense_2',
                    'kernel_initializer': {
                        'config': {
                            'scale': 1.0,
                            'mode': 'fan_avg',
                            'seed': null,
                            'distribution': 'uniform'
                        },
                        'class_name': 'VarianceScaling'
                    },
                    'activity_regularizer': null
                },
                'class_name': 'Dense'
            }
        ],
        'keras_version': '2.1.1',
        'class_name': 'Sequential'
    }
};
var fakeRoundtripModel = {
    modelTopology: {
        'backend': 'tensorflow',
        'class_name': 'Model',
        'keras_version': '2.1.1',
        'config': {
            'name': 'mnist',
            'output_layers': [['dense_16', 0, 0]],
            'layers': [
                {
                    'class_name': 'InputLayer',
                    'name': 'input_6',
                    'inbound_nodes': [],
                    'config': {
                        'batch_input_shape': [null, 28, 28, 1],
                        'sparse': false,
                        'name': 'input_6',
                        'dtype': 'float32'
                    }
                },
                {
                    'class_name': 'Conv2D',
                    'name': 'conv2d_15',
                    'inbound_nodes': [[['input_6', 0, 0, {}]]],
                    'config': {
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'padding': 'valid',
                        'use_bias': true,
                        'strides': [1, 1],
                        'bias_regularizer': null,
                        'activity_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'data_format': 'channels_last',
                        'dilation_rate': [1, 1],
                        'kernel_constraint': null,
                        'kernel_regularizer': null,
                        'kernel_size': [3, 3],
                        'activation': 'relu',
                        'name': 'conv2d_15',
                        'filters': 32,
                        'trainable': true,
                        'bias_constraint': null
                    }
                },
                {
                    'class_name': 'Conv2D',
                    'name': 'conv2d_16',
                    'inbound_nodes': [[['conv2d_15', 0, 0, {}]]],
                    'config': {
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'padding': 'valid',
                        'use_bias': true,
                        'strides': [1, 1],
                        'bias_regularizer': null,
                        'activity_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'data_format': 'channels_last',
                        'dilation_rate': [1, 1],
                        'kernel_constraint': null,
                        'kernel_regularizer': null,
                        'kernel_size': [3, 3],
                        'activation': 'relu',
                        'name': 'conv2d_16',
                        'filters': 64,
                        'trainable': true,
                        'bias_constraint': null
                    }
                },
                {
                    'class_name': 'MaxPooling2D',
                    'name': 'max_pooling2d_8',
                    'inbound_nodes': [[['conv2d_16', 0, 0, {}]]],
                    'config': {
                        'padding': 'valid',
                        'strides': [2, 2],
                        'pool_size': [2, 2],
                        'data_format': 'channels_last',
                        'name': 'max_pooling2d_8',
                        'trainable': true
                    }
                },
                {
                    'class_name': 'Dropout',
                    'name': 'dropout_15',
                    'inbound_nodes': [[['max_pooling2d_8', 0, 0, {}]]],
                    'config': {
                        'rate': 0.25,
                        'noise_shape': null,
                        'name': 'dropout_15',
                        'trainable': true,
                        'seed': null
                    }
                },
                {
                    'class_name': 'Flatten',
                    'name': 'flatten_8',
                    'inbound_nodes': [[['dropout_15', 0, 0, {}]]],
                    'config': { 'name': 'flatten_8', 'trainable': true }
                },
                {
                    'class_name': 'Dense',
                    'name': 'dense_15',
                    'inbound_nodes': [[['flatten_8', 0, 0, {}]]],
                    'config': {
                        'use_bias': true,
                        'bias_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'kernel_constraint': null,
                        'bias_constraint': null,
                        'kernel_regularizer': null,
                        'activation': 'relu',
                        'name': 'dense_15',
                        'activity_regularizer': null,
                        'trainable': true,
                        'units': 128
                    }
                },
                {
                    'class_name': 'Dropout',
                    'name': 'dropout_16',
                    'inbound_nodes': [[['dense_15', 0, 0, {}]]],
                    'config': {
                        'rate': 0.5,
                        'noise_shape': null,
                        'name': 'dropout_16',
                        'trainable': true,
                        'seed': null
                    }
                },
                {
                    'class_name': 'Dense',
                    'name': 'dense_16',
                    'inbound_nodes': [[['dropout_16', 0, 0, {}]]],
                    'config': {
                        'use_bias': true,
                        'bias_regularizer': null,
                        'kernel_initializer': {
                            'class_name': 'VarianceScaling',
                            'config': {
                                'distribution': 'uniform',
                                'scale': 1.0,
                                'mode': 'fan_avg',
                                'seed': null
                            }
                        },
                        'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                        'kernel_constraint': null,
                        'bias_constraint': null,
                        'kernel_regularizer': null,
                        'activation': 'softmax',
                        'name': 'dense_16',
                        'activity_regularizer': null,
                        'trainable': true,
                        'units': 10
                    }
                }
            ],
            'input_layers': [['input_6', 0, 0]]
        }
    }
};
//# sourceMappingURL=models_test.js.map