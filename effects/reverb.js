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

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

var _isDefined = require('../core/utils/isDefined');

var _isDefined2 = _interopRequireDefault(_isDefined);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createImpulseResponse(_ref) {
    var time = _ref.time,
        decay = _ref.decay,
        reverse = _ref.reverse,
        buffer = _ref.buffer;

    var rate = _sono2.default.context.sampleRate;
    var length = Math.floor(rate * time);

    var impulseResponse = void 0;

    if (buffer && buffer.length === length) {
        impulseResponse = buffer;
    } else {
        impulseResponse = _sono2.default.context.createBuffer(2, length, rate);
    }

    var left = impulseResponse.getChannelData(0);
    var right = impulseResponse.getChannelData(1);

    var n = void 0,
        e = void 0;
    for (var i = 0; i < length; i++) {
        n = reverse ? length - i : i;
        e = Math.pow(1 - n / length, decay);
        left[i] = (Math.random() * 2 - 1) * e;
        right[i] = (Math.random() * 2 - 1) * e;
    }

    return impulseResponse;
}

var Reverb = function (_AbstractEffect) {
    (0, _inherits3.default)(Reverb, _AbstractEffect);

    function Reverb() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref2$time = _ref2.time,
            time = _ref2$time === undefined ? 1 : _ref2$time,
            _ref2$decay = _ref2.decay,
            decay = _ref2$decay === undefined ? 5 : _ref2$decay,
            _ref2$reverse = _ref2.reverse,
            reverse = _ref2$reverse === undefined ? false : _ref2$reverse,
            _ref2$wet = _ref2.wet,
            wet = _ref2$wet === undefined ? 1 : _ref2$wet,
            _ref2$dry = _ref2.dry,
            dry = _ref2$dry === undefined ? 1 : _ref2$dry;

        (0, _classCallCheck3.default)(this, Reverb);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createConvolver()));

        _this._convolver = _this._node;

        _this._length = 0;
        _this._impulseResponse = null;
        _this._opts = {};

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ time: time, decay: decay, reverse: reverse });
        return _this;
    }

    Reverb.prototype.update = function update(_ref3) {
        var time = _ref3.time,
            decay = _ref3.decay,
            reverse = _ref3.reverse;

        var changed = false;
        if (time !== this._opts.time && (0, _isSafeNumber2.default)(time)) {
            this._opts.time = time;
            changed = true;
        }
        if (decay !== this._opts.decay && (0, _isSafeNumber2.default)(decay)) {
            this._opts.decay = decay;
            changed = true;
        }
        if ((0, _isDefined2.default)(reverse) && reverse !== this._reverse) {
            this._opts.reverse = reverse;
            changed = true;
        }
        if (!changed) {
            return;
        }

        this._opts.buffer = time <= 0 ? null : createImpulseResponse(this._opts);
        this._convolver.buffer = this._opts.buffer;
    };

    (0, _createClass3.default)(Reverb, [{
        key: 'time',
        get: function get() {
            return this._opts.time;
        },
        set: function set(value) {
            this.update({ time: value });
        }
    }, {
        key: 'decay',
        get: function get() {
            return this._opts.decay;
        },
        set: function set(value) {
            this.update({ decay: value });
        }
    }, {
        key: 'reverse',
        get: function get() {
            return this._opts.reverse;
        },
        set: function set(value) {
            this.update({ reverse: value });
        }
    }]);
    return Reverb;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('reverb', function (opts) {
    return new Reverb(opts);
});