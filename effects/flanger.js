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

var _abstractEffect = require('./abstract-effect');

var _abstractEffect2 = _interopRequireDefault(_abstractEffect);

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MonoFlanger = function (_AbstractEffect) {
    (0, _inherits3.default)(MonoFlanger, _AbstractEffect);

    function MonoFlanger() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$delay = _ref.delay,
            delay = _ref$delay === undefined ? 0.005 : _ref$delay,
            _ref$feedback = _ref.feedback,
            feedback = _ref$feedback === undefined ? 0.5 : _ref$feedback,
            _ref$frequency = _ref.frequency,
            frequency = _ref$frequency === undefined ? 0.002 : _ref$frequency,
            _ref$gain = _ref.gain,
            gain = _ref$gain === undefined ? 0.25 : _ref$gain,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 1 : _ref$dry;

        (0, _classCallCheck3.default)(this, MonoFlanger);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createDelay()));

        _this._delay = _this._node;
        _this._feedback = _sono2.default.context.createGain();
        _this._lfo = _sono2.default.context.createOscillator();
        _this._gain = _sono2.default.context.createGain();
        _this._lfo.type = 'sine';

        _this._delay.connect(_this._feedback);
        _this._feedback.connect(_this._in);

        _this._lfo.connect(_this._gain);
        _this._gain.connect(_this._delay.delayTime);
        _this._lfo.start(0);

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ delay: delay, feedback: feedback, frequency: frequency, gain: gain });
        return _this;
    }

    MonoFlanger.prototype.update = function update(options) {
        this.delay = options.delay;
        this.frequency = options.frequency;
        this.gain = options.gain;
        this.feedback = options.feedback;
    };

    (0, _createClass3.default)(MonoFlanger, [{
        key: 'delay',
        get: function get() {
            return this._delay.delayTime.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._delay.delayTime, value);
        }
    }, {
        key: 'frequency',
        get: function get() {
            return this._lfo.frequency.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._lfo.frequency, value);
        }
    }, {
        key: 'gain',
        get: function get() {
            return this._gain.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._gain.gain, value);
        }
    }, {
        key: 'feedback',
        get: function get() {
            return this._feedback.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._feedback.gain, value);
        }
    }]);
    return MonoFlanger;
}(_abstractEffect2.default);

_sono2.default.register('monoFlanger', function (opts) {
    return new MonoFlanger(opts);
});

var StereoFlanger = function (_AbstractEffect2) {
    (0, _inherits3.default)(StereoFlanger, _AbstractEffect2);

    function StereoFlanger() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref2$delay = _ref2.delay,
            delay = _ref2$delay === undefined ? 0.003 : _ref2$delay,
            _ref2$feedback = _ref2.feedback,
            feedback = _ref2$feedback === undefined ? 0.5 : _ref2$feedback,
            _ref2$frequency = _ref2.frequency,
            frequency = _ref2$frequency === undefined ? 0.5 : _ref2$frequency,
            _ref2$gain = _ref2.gain,
            gain = _ref2$gain === undefined ? 0.005 : _ref2$gain,
            _ref2$wet = _ref2.wet,
            wet = _ref2$wet === undefined ? 1 : _ref2$wet,
            _ref2$dry = _ref2.dry,
            dry = _ref2$dry === undefined ? 1 : _ref2$dry;

        (0, _classCallCheck3.default)(this, StereoFlanger);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect2.call(this, _sono2.default.context.createChannelSplitter(2), _sono2.default.context.createChannelMerger(2)));

        _this2._splitter = _this2._node;
        _this2._merger = _this2._nodeOut;
        _this2._feedbackL = _sono2.default.context.createGain();
        _this2._feedbackR = _sono2.default.context.createGain();
        _this2._lfo = _sono2.default.context.createOscillator();
        _this2._lfoGainL = _sono2.default.context.createGain();
        _this2._lfoGainR = _sono2.default.context.createGain();
        _this2._delayL = _sono2.default.context.createDelay();
        _this2._delayR = _sono2.default.context.createDelay();

        _this2._lfo.type = 'sine';

        _this2._splitter.connect(_this2._delayL, 0);
        _this2._splitter.connect(_this2._delayR, 1);

        _this2._delayL.connect(_this2._feedbackL);
        _this2._delayR.connect(_this2._feedbackR);

        _this2._feedbackL.connect(_this2._delayR);
        _this2._feedbackR.connect(_this2._delayL);

        _this2._delayL.connect(_this2._merger, 0, 0);
        _this2._delayR.connect(_this2._merger, 0, 1);

        _this2._lfo.connect(_this2._lfoGainL);
        _this2._lfo.connect(_this2._lfoGainR);
        _this2._lfoGainL.connect(_this2._delayL.delayTime);
        _this2._lfoGainR.connect(_this2._delayR.delayTime);
        _this2._lfo.start(0);

        _this2.wet = wet;
        _this2.dry = dry;
        _this2.update({ delay: delay, feedback: feedback, frequency: frequency, gain: gain });
        return _this2;
    }

    StereoFlanger.prototype.update = function update(options) {
        this.delay = options.delay;
        this.frequency = options.frequency;
        this.gain = options.gain;
        this.feedback = options.feedback;
    };

    (0, _createClass3.default)(StereoFlanger, [{
        key: 'delay',
        get: function get() {
            return this._delayL.delayTime.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._delayL.delayTime, value);
            this._delayR.delayTime.value = this._delayL.delayTime.value;
        }
    }, {
        key: 'frequency',
        get: function get() {
            return this._lfo.frequency.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._lfo.frequency, value);
        }
    }, {
        key: 'gain',
        get: function get() {
            return this._lfoGainL.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._lfoGainL.gain, value);
            this._lfoGainR.gain.value = 0 - this._lfoGainL.gain.value;
        }
    }, {
        key: 'feedback',
        get: function get() {
            return this._feedbackL.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._feedbackL.gain, value);
            this._feedbackR.gain.value = this._feedbackL.gain.value;
        }
    }]);
    return StereoFlanger;
}(_abstractEffect2.default);

_sono2.default.register('stereoFlanger', function (opts) {
    return new StereoFlanger(opts);
});

exports.default = _sono2.default.register('flanger', function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return opts.stereo ? new StereoFlanger(opts) : new MonoFlanger(opts);
});