'use strict';

exports.__esModule = true;
exports.allpass = exports.notch = exports.peaking = exports.highshelf = exports.lowshelf = exports.bandpass = exports.highpass = exports.lowpass = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _abstractEffect = require('./abstract-effect');

var _abstractEffect2 = _interopRequireDefault(_abstractEffect);

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function safeOption() {
    var value = null;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    for (var i = 0; i < args.length; i++) {
        if ((0, _isSafeNumber2.default)(args[i])) {
            value = args[i];
            break;
        }
    }
    return value;
}

// https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
// For lowpass and highpass Q indicates how peaked the frequency is around the cutoff.
// The greater the value is, the greater is the peak
var minFrequency = 40;
var maxFrequency = _sono2.default.context.sampleRate / 2;

function getFrequency(value) {
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxFrequency / minFrequency) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
    // Get back to the frequency value between min and max.
    return maxFrequency * multiplier;
}

var Filter = function (_AbstractEffect) {
    (0, _inherits3.default)(Filter, _AbstractEffect);

    function Filter() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$type = _ref.type,
            type = _ref$type === undefined ? 'lowpass' : _ref$type,
            _ref$frequency = _ref.frequency,
            frequency = _ref$frequency === undefined ? 1000 : _ref$frequency,
            _ref$detune = _ref.detune,
            detune = _ref$detune === undefined ? 0 : _ref$detune,
            _ref$q = _ref.q,
            q = _ref$q === undefined ? 0 : _ref$q,
            _ref$gain = _ref.gain,
            gain = _ref$gain === undefined ? 1 : _ref$gain,
            _ref$peak = _ref.peak,
            peak = _ref$peak === undefined ? 0 : _ref$peak,
            _ref$boost = _ref.boost,
            boost = _ref$boost === undefined ? 0 : _ref$boost,
            _ref$width = _ref.width,
            width = _ref$width === undefined ? 100 : _ref$width,
            _ref$sharpness = _ref.sharpness,
            sharpness = _ref$sharpness === undefined ? 0 : _ref$sharpness,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 0 : _ref$dry;

        (0, _classCallCheck3.default)(this, Filter);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createBiquadFilter()));

        _this._node.type = type;

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ frequency: frequency, gain: gain, detune: detune, q: q, peak: peak, boost: boost, width: width, sharpness: sharpness });
        return _this;
    }

    Filter.prototype.update = function update(options) {
        this.setSafeParamValue(this._node.frequency, options.frequency);
        this.setSafeParamValue(this._node.gain, safeOption(options.boost, options.gain));
        this.setSafeParamValue(this._node.detune, options.detune);

        var q = safeOption(options.peak, options.width, options.sharpness, options.q);
        this.setSafeParamValue(this._node.Q, q);
    };

    Filter.prototype.setByPercent = function setByPercent(_ref2) {
        var _ref2$percent = _ref2.percent,
            percent = _ref2$percent === undefined ? 0.5 : _ref2$percent;

        this.update({
            frequency: getFrequency(percent)
        });
    };

    (0, _createClass3.default)(Filter, [{
        key: 'type',
        get: function get() {
            return this._node.type;
        },
        set: function set(value) {
            this._node.type = value;
        }
    }, {
        key: 'frequency',
        get: function get() {
            return this._node.frequency.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.frequency, value);
        }
    }, {
        key: 'q',
        get: function get() {
            return this._node.Q.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.Q, value);
        }
    }, {
        key: 'Q',
        get: function get() {
            return this.q;
        },
        set: function set(value) {
            this.q = value;
        }
    }, {
        key: 'peak',
        get: function get() {
            return this.q;
        },
        set: function set(value) {
            this.q = value;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._node.frequency.value / this._node.Q.value;
        },
        set: function set(value) {
            if (value <= 0) {
                this.q = 0;
                return;
            }
            this.q = this._node.frequency.value / value;
        }
    }, {
        key: 'sharpness',
        get: function get() {
            return this.q;
        },
        set: function set(value) {
            this.q = value;
        }
    }, {
        key: 'boost',
        get: function get() {
            return this._node.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.gain, value);
        }
    }, {
        key: 'gain',
        get: function get() {
            return this.boost;
        },
        set: function set(value) {
            this.boost = value;
        }
    }, {
        key: 'detune',
        get: function get() {
            return this._node.detune.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.detune, value);
        }
    }, {
        key: 'maxFrequency',
        get: function get() {
            return _sono2.default.context.sampleRate / 2;
        }
    }]);
    return Filter;
}(_abstractEffect2.default);

var lowpass = _sono2.default.register('lowpass', function () {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref3.frequency,
        peak = _ref3.peak,
        q = _ref3.q;

    return new Filter({ type: 'lowpass', frequency: frequency, peak: peak, q: q });
});

var highpass = _sono2.default.register('highpass', function () {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref4.frequency,
        peak = _ref4.peak,
        q = _ref4.q;

    return new Filter({ type: 'highpass', frequency: frequency, peak: peak, q: q });
});

var lowshelf = _sono2.default.register('lowshelf', function () {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref5.frequency,
        boost = _ref5.boost,
        gain = _ref5.gain;

    return new Filter({ type: 'lowshelf', frequency: frequency, boost: boost, gain: gain, q: 0 });
});

var highshelf = _sono2.default.register('highshelf', function () {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref6.frequency,
        boost = _ref6.boost,
        gain = _ref6.gain;

    return new Filter({ type: 'highshelf', frequency: frequency, boost: boost, gain: gain, q: 0 });
});

var peaking = _sono2.default.register('peaking', function () {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref7.frequency,
        width = _ref7.width,
        boost = _ref7.boost,
        gain = _ref7.gain,
        q = _ref7.q;

    return new Filter({ type: 'peaking', frequency: frequency, width: width, boost: boost, gain: gain, q: q });
});

var bandpass = _sono2.default.register('bandpass', function () {
    var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref8.frequency,
        width = _ref8.width,
        q = _ref8.q;

    return new Filter({ type: 'bandpass', frequency: frequency, width: width, q: q });
});

var notch = _sono2.default.register('notch', function () {
    var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref9.frequency,
        width = _ref9.width,
        gain = _ref9.gain,
        q = _ref9.q;

    return new Filter({ type: 'notch', frequency: frequency, width: width, gain: gain, q: q });
});

var allpass = _sono2.default.register('allpass', function () {
    var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        frequency = _ref10.frequency,
        sharpness = _ref10.sharpness,
        q = _ref10.q;

    return new Filter({ type: 'allpass', frequency: frequency, sharpness: sharpness, q: q });
});

exports.default = _sono2.default.register('filter', function (opts) {
    return new Filter(opts);
});
exports.lowpass = lowpass;
exports.highpass = highpass;
exports.bandpass = bandpass;
exports.lowshelf = lowshelf;
exports.highshelf = highshelf;
exports.peaking = peaking;
exports.notch = notch;
exports.allpass = allpass;