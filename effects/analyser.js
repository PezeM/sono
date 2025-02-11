'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _abstractDirectEffect = require('./abstract-direct-effect');

var _abstractDirectEffect2 = _interopRequireDefault(_abstractDirectEffect);

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) * Math.LOG2E);
    return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
    return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) * Math.LOG2E);
}

var Analyser = function (_AbstractDirectEffect) {
    (0, _inherits3.default)(Analyser, _AbstractDirectEffect);

    function Analyser() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$fftSize = _ref.fftSize,
            fftSize = _ref$fftSize === undefined ? 2048 : _ref$fftSize,
            _ref$minDecibels = _ref.minDecibels,
            minDecibels = _ref$minDecibels === undefined ? -100 : _ref$minDecibels,
            _ref$maxDecibels = _ref.maxDecibels,
            maxDecibels = _ref$maxDecibels === undefined ? -30 : _ref$maxDecibels,
            _ref$smoothing = _ref.smoothing,
            smoothing = _ref$smoothing === undefined ? 0.9 : _ref$smoothing,
            _ref$useFloats = _ref.useFloats,
            useFloats = _ref$useFloats === undefined ? false : _ref$useFloats;

        (0, _classCallCheck3.default)(this, Analyser);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractDirectEffect.call(this, _sono2.default.context.createAnalyser()));

        _this._useFloats = !!useFloats;
        _this._waveform = null;
        _this._frequencies = null;

        _this._node.fftSize = fftSize;

        _this.update({ minDecibels: minDecibels, maxDecibels: maxDecibels, smoothing: smoothing });
        return _this;
    }

    Analyser.prototype.update = function update(_ref2) {
        var minDecibels = _ref2.minDecibels,
            maxDecibels = _ref2.maxDecibels,
            smoothing = _ref2.smoothing;

        if ((0, _isSafeNumber2.default)(smoothing)) {
            this._node.smoothingTimeConstant = smoothing;
        }
        if ((0, _isSafeNumber2.default)(minDecibels)) {
            this._node.minDecibels = minDecibels;
        }
        if ((0, _isSafeNumber2.default)(maxDecibels)) {
            this._node.maxDecibels = maxDecibels;
        }
    };

    Analyser.prototype.getWaveform = function getWaveform() {
        var useFloats = this._useFloats && this._node.getFloatTimeDomainData;

        if (!this._waveform) {
            this._waveform = this._createArray(useFloats, this._node.fftSize);
        }

        if (useFloats) {
            this._node.getFloatTimeDomainData(this._waveform);
        } else {
            this._node.getByteTimeDomainData(this._waveform);
        }

        return this._waveform;
    };

    Analyser.prototype.getFrequencies = function getFrequencies() {
        var useFloats = this._useFloats && this._node.getFloatFrequencyData;

        if (!this._frequencies) {
            this._frequencies = this._createArray(useFloats, this._node.frequencyBinCount);
        }

        if (useFloats) {
            this._node.getFloatFrequencyData(this._frequencies);
        } else {
            this._node.getByteFrequencyData(this._frequencies);
        }

        return this._frequencies;
    };

    Analyser.prototype.getAmplitude = function getAmplitude(callback) {
        if (!this._amplitudeWorker) {
            this._createAmplitudeAnalyser();
        }
        this._amplitudeCallback = callback || this._amplitudeCallback;
        var f = new Float32Array(this._node.fftSize);
        f.set(this.getFrequencies(true));
        this._amplitudeWorker.postMessage({
            sum: 0,
            length: f.byteLength,
            numSamples: this._node.fftSize / 2,
            b: f.buffer
        }, [f.buffer]);
    };

    Analyser.prototype.getPitch = function getPitch(callback) {
        if (!this._pitchWorker) {
            this._createPitchAnalyser();
        }
        this._pitchCallback = callback || this._pitchCallback;
        var f = new Float32Array(this._node.fftSize);
        f.set(this.getWaveform(true));
        this._pitchWorker.postMessage({
            sampleRate: _sono2.default.context.sampleRate,
            b: f.buffer
        }, [f.buffer]);
    };

    Analyser.prototype._createArray = function _createArray(useFloats, length) {
        return useFloats ? new Float32Array(length) : new Uint8Array(length);
    };

    Analyser.prototype._createAmplitudeAnalyser = function _createAmplitudeAnalyser() {
        var _this2 = this;

        //the worker returns a normalized value
        //first a sum of all magnitudes devided by the byteLength, then devide  by half the fft (1channel)
        var amplitudeBlob = new Blob(['onmessage = function(e) {\n                var data = e.data;\n                var f = new Float32Array(data.b);\n                for (var i = 0; i < f.length; i++) {\n                    data.sum += f[i];\n                }\n                data.sum /= f.length;\n                postMessage(Math.max(1.0 - (data.sum / data.numSamples * -1.0), 0));\n            };']);
        var amplitudeBlobURL = URL.createObjectURL(amplitudeBlob);
        this._amplitudeWorker = new Worker(amplitudeBlobURL);
        this._amplitudeWorker.onmessage = function (event) {
            if (!_this2._amplitudeCallback) {
                return;
            }
            _this2._amplitudeCallback(event.data);
        };
    };

    Analyser.prototype._createPitchAnalyser = function _createPitchAnalyser() {
        var _this3 = this;

        var pitchBlob = new Blob(['onmessage = function(e) {\n                var data = e.data;\n                var sampleRate = data.sampleRate;\n                var buf = new Float32Array(data.b);\n                var SIZE = buf.length;\n                var MAX_SAMPLES = Math.floor(SIZE / 2);\n                var bestOffset = -1;\n                var bestCorrel = 0;\n                var rms = 0;\n                var foundGoodCorrelation = false;\n                var correls = new Array(MAX_SAMPLES);\n                for (var i = 0; i < SIZE; i++) {\n                    var val = buf[i];\n                    rms += val * val;\n                }\n                rms = Math.sqrt(rms / SIZE);\n                if (rms < 0.01) {\n                    postMessage(-1);\n                } else {\n                    var lastCorrelation = 1;\n                    for (var offset = 0; offset < MAX_SAMPLES; offset++) {\n                        var correl = 0;\n                        for (var i = 0; i < MAX_SAMPLES; i++) {\n                            correl += Math.abs(buf[i] - buf[i + offset]);\n                        }\n                        correl = 1 - correl / MAX_SAMPLES;\n                        correls[offset] = correl;\n                        if (correl > 0.9 && correl > lastCorrelation) {\n                            foundGoodCorrelation = true;\n                            if (correl > bestCorrel) {\n                                bestCorrel = correl;\n                                bestOffset = offset;\n                            }\n                        } else if (foundGoodCorrelation) {\n                            var shift = (correls[bestOffset + 1] - correls[bestOffset - 1]) / correls[bestOffset];\n                            postMessage(sampleRate / (bestOffset + 8 * shift));\n                        }\n                        lastCorrelation = correl;\n                    }\n                    if (bestCorrel > 0.01) {\n                        postMessage(sampleRate / bestOffset);\n                    } else {\n                        postMessage(-1);\n                    }\n                }\n            };']);

        var pitchBlobURL = URL.createObjectURL(pitchBlob);
        this._pitchWorker = new Worker(pitchBlobURL);

        var noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        var pitchCallbackObject = {
            hertz: 0,
            note: '',
            noteIndex: 0,
            detuneCents: 0,
            detune: ''
        };

        this._pitchWorker.onmessage = function (event) {
            if (!_this3._pitchCallback) {
                return;
            }
            var hz = event.data;
            if (hz !== -1) {
                var note = noteFromPitch(hz);
                var detune = centsOffFromPitch(hz, note);
                pitchCallbackObject.hertz = hz;
                pitchCallbackObject.noteIndex = note % 12;
                pitchCallbackObject.note = noteStrings[note % 12];
                pitchCallbackObject.detuneCents = detune;
                if (detune === 0) {
                    pitchCallbackObject.detune = '';
                } else if (detune < 0) {
                    pitchCallbackObject.detune = 'flat';
                } else {
                    pitchCallbackObject.detune = 'sharp';
                }
            }
            _this3._pitchCallback(pitchCallbackObject);
        };
    };

    (0, _createClass3.default)(Analyser, [{
        key: 'frequencyBinCount',
        get: function get() {
            return this._node.frequencyBinCount;
        }
    }, {
        key: 'maxDecibels',
        get: function get() {
            return this._node.maxDecibels;
        },
        set: function set(value) {
            if ((0, _isSafeNumber2.default)(value)) {
                this._node.maxDecibels = value;
            }
        }
    }, {
        key: 'minDecibels',
        get: function get() {
            return this._node.minDecibels;
        },
        set: function set(value) {
            if ((0, _isSafeNumber2.default)(value)) {
                this._node.minDecibels = value;
            }
        }
    }, {
        key: 'smoothing',
        get: function get() {
            return this._node.smoothingTimeConstant;
        },
        set: function set(value) {
            if ((0, _isSafeNumber2.default)(value)) {
                this._node.smoothingTimeConstant = value;
            }
        }
    }]);
    return Analyser;
}(_abstractDirectEffect2.default);

exports.default = _sono2.default.register('analyser', function (opts) {
    return new Analyser(opts);
});