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

var _file = require('../core/utils/file');

var _file2 = _interopRequireDefault(_file);

var _loader = require('../core/utils/loader');

var _loader2 = _interopRequireDefault(_loader);

var _sound = require('../core/sound');

var _sound2 = _interopRequireDefault(_sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Convolver = function (_AbstractEffect) {
    (0, _inherits3.default)(Convolver, _AbstractEffect);

    function Convolver() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            impulse = _ref.impulse,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 1 : _ref$dry;

        (0, _classCallCheck3.default)(this, Convolver);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createConvolver(), null, false));

        _this._loader = null;

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ impulse: impulse });
        return _this;
    }

    Convolver.prototype._load = function _load(src) {
        var _this2 = this;

        if (_sono2.default.context.isFake) {
            return;
        }
        if (this._loader) {
            this._loader.destroy();
        }
        this._loader = new _loader2.default(src);
        this._loader.audioContext = _sono2.default.context;
        this._loader.once('complete', function (impulse) {
            return _this2.update({ impulse: impulse });
        });
        this._loader.once('error', function (error) {
            return console.error(error);
        });
        this._loader.start();
    };

    Convolver.prototype.update = function update(_ref2) {
        var _this3 = this;

        var impulse = _ref2.impulse;

        if (!impulse) {
            return this;
        }

        if (_file2.default.isAudioBuffer(impulse)) {
            this._node.buffer = impulse;
            this.enable(true);
            return this;
        }

        if (impulse instanceof _sound2.default) {
            if (impulse.data) {
                this.update({ impulse: impulse.data });
            } else {
                impulse.once('ready', function (sound) {
                    return _this3.update({
                        impulse: sound.data
                    });
                });
            }
            return this;
        }

        if (_file2.default.isArrayBuffer(impulse)) {
            this._load(impulse);
            return this;
        }

        if (_file2.default.isURL(_file2.default.getSupportedFile(impulse))) {
            this._load(_file2.default.getSupportedFile(impulse));
        }

        return this;
    };

    (0, _createClass3.default)(Convolver, [{
        key: 'impulse',
        get: function get() {
            return this._node.buffer;
        },
        set: function set(impulse) {
            this.update({ impulse: impulse });
        }
    }]);
    return Convolver;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('convolver', function (opts) {
    return new Convolver(opts);
});