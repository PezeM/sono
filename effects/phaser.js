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

var Phaser = function (_AbstractEffect) {
    (0, _inherits3.default)(Phaser, _AbstractEffect);

    function Phaser() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$stages = _ref.stages,
            stages = _ref$stages === undefined ? 8 : _ref$stages,
            _ref$feedback = _ref.feedback,
            feedback = _ref$feedback === undefined ? 0.5 : _ref$feedback,
            _ref$frequency = _ref.frequency,
            frequency = _ref$frequency === undefined ? 0.5 : _ref$frequency,
            _ref$gain = _ref.gain,
            gain = _ref$gain === undefined ? 300 : _ref$gain,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 0.8 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 0.8 : _ref$dry;

        (0, _classCallCheck3.default)(this, Phaser);

        stages = stages || 8;

        var filters = [];
        for (var i = 0; i < stages; i++) {
            filters.push(_sono2.default.context.createBiquadFilter());
        }

        var first = filters[0];
        var last = filters[filters.length - 1];

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, first, last));

        _this._stages = stages;
        _this._feedback = _sono2.default.context.createGain();
        _this._lfo = _sono2.default.context.createOscillator();
        _this._lfoGain = _sono2.default.context.createGain();
        _this._lfo.type = 'sine';

        for (var _i = 0; _i < filters.length; _i++) {
            var filter = filters[_i];
            filter.type = 'allpass';
            filter.frequency.value = 1000 * _i;
            _this._lfoGain.connect(filter.frequency);
            // filter.Q.value = 10;

            if (_i > 0) {
                filters[_i - 1].connect(filter);
            }
        }

        _this._lfo.connect(_this._lfoGain);
        _this._lfo.start(0);

        _this._nodeOut.connect(_this._feedback);
        _this._feedback.connect(_this._node);

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ frequency: frequency, gain: gain, feedback: feedback });
        return _this;
    }

    Phaser.prototype.enable = function enable(value) {
        _AbstractEffect.prototype.enable.call(this, value);

        if (this._feedback) {
            this._feedback.disconnect();
        }

        if (value && this._feedback) {
            this._nodeOut.connect(this._feedback);
            this._feedback.connect(this._node);
        }
    };

    Phaser.prototype.update = function update(options) {
        this.frequency = options.frequency;
        this.gain = options.gain;
        this.feedback = options.feedback;
    };

    (0, _createClass3.default)(Phaser, [{
        key: 'stages',
        get: function get() {
            return this._stages;
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
            return this._lfoGain.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._lfoGain.gain, value);
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
    return Phaser;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('phaser', function (opts) {
    return new Phaser(opts);
});