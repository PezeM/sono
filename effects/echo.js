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

var Echo = function (_AbstractEffect) {
    (0, _inherits3.default)(Echo, _AbstractEffect);

    function Echo() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$delay = _ref.delay,
            delay = _ref$delay === undefined ? 0.5 : _ref$delay,
            _ref$feedback = _ref.feedback,
            feedback = _ref$feedback === undefined ? 0.5 : _ref$feedback,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 1 : _ref$dry;

        (0, _classCallCheck3.default)(this, Echo);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createDelay(), _sono2.default.context.createGain()));

        _this._delay = _this._node;
        _this._feedback = _this._nodeOut;

        _this._delay.connect(_this._feedback);
        _this._feedback.connect(_this._delay);

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ delay: delay, feedback: feedback });
        return _this;
    }

    Echo.prototype.enable = function enable(value) {
        _AbstractEffect.prototype.enable.call(this, value);

        if (this._feedback && value) {
            this._feedback.connect(this._delay);
        }
    };

    Echo.prototype.update = function update(options) {
        this.delay = options.delay;
        this.feedback = options.feedback;
    };

    (0, _createClass3.default)(Echo, [{
        key: 'delay',
        get: function get() {
            return this._delay.delayTime.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._delay.delayTime, value);
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
    return Echo;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('echo', function (opts) {
    return new Echo(opts);
});