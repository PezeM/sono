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

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

var _isDefined = require('../core/utils/isDefined');

var _isDefined2 = _interopRequireDefault(_isDefined);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pannerDefaults = {
    panningModel: 'HRTF',
    distanceModel: 'linear',
    refDistance: 1,
    maxDistance: 1000,
    rolloffFactor: 1,
    coneInnerAngle: 360,
    coneOuterAngle: 0,
    coneOuterGain: 0
};

function safeNumber(x) {
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if ((0, _isSafeNumber2.default)(x)) {
        return x;
    }
    return y;
}

// cross product of 2 vectors
function cross(a, b) {
    var ax = a.x,
        ay = a.y,
        az = a.z;
    var bx = b.x,
        by = b.y,
        bz = b.z;
    a.x = ay * bz - az * by;
    a.y = az * bx - ax * bz;
    a.z = ax * by - ay * bx;
}

// normalise to unit vector
function normalize(vec3) {
    if (vec3.x === 0 && vec3.y === 0 && vec3.z === 0) {
        return vec3;
    }
    var length = Math.sqrt(vec3.x * vec3.x + vec3.y * vec3.y + vec3.z * vec3.z);
    var invScalar = 1 / length;
    vec3.x *= invScalar;
    vec3.y *= invScalar;
    vec3.z *= invScalar;
    return vec3;
}

var vecPool = {
    pool: [],
    get: function get(x, y, z) {
        var v = this.pool.length ? this.pool.pop() : {
            x: 0,
            y: 0,
            z: 0
        };
        // check if a vector has been passed in
        if (typeof x !== 'undefined' && isNaN(x) && 'x' in x && 'y' in x && 'z' in x) {
            v.x = safeNumber(x.x);
            v.y = safeNumber(x.y);
            v.z = safeNumber(x.z);
        } else {
            v.x = safeNumber(x);
            v.y = safeNumber(y);
            v.z = safeNumber(z);
        }
        return v;
    },
    dispose: function dispose(instance) {
        this.pool.push(instance);
    }
};

var globalUp = vecPool.get(0, 1, 0);
var angle45 = Math.PI / 4;
var angle90 = Math.PI / 2;

function setNodeOrientation(pannerNode, fw) {
    // set the orientation of the source (where the audio is coming from)
    // calculate up vec ( up = (forward cross (0, 1, 0)) cross forward )
    var up = vecPool.get(fw.x, fw.y, fw.z);
    cross(up, globalUp);
    cross(up, fw);
    normalize(up);
    normalize(fw);
    // set the audio context's listener position to match the camera position
    pannerNode.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z);
    // return the vecs to the pool
    vecPool.dispose(fw);
    vecPool.dispose(up);
}

function setNodePosition(nodeOrListener, vec) {
    nodeOrListener.setPosition(vec.x, vec.y, vec.z);
    vecPool.dispose(vec);
}

var Panner = function (_AbstractDirectEffect) {
    (0, _inherits3.default)(Panner, _AbstractDirectEffect);

    function Panner() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            panningModel = _ref.panningModel,
            distanceModel = _ref.distanceModel,
            refDistance = _ref.refDistance,
            maxDistance = _ref.maxDistance,
            rolloffFactor = _ref.rolloffFactor,
            coneInnerAngle = _ref.coneInnerAngle,
            coneOuterAngle = _ref.coneOuterAngle,
            coneOuterGain = _ref.coneOuterGain;

        (0, _classCallCheck3.default)(this, Panner);

        // Default for stereo is 'HRTF' can also be 'equalpower'
        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractDirectEffect.call(this, _sono2.default.context.createPanner()));

        _this._node.panningModel = panningModel || pannerDefaults.panningModel;

        // Distance model and attributes
        // Can be 'linear' 'inverse' 'exponential'
        _this._node.distanceModel = distanceModel || pannerDefaults.distanceModel;
        _this._node.refDistance = (0, _isDefined2.default)(refDistance) ? refDistance : pannerDefaults.refDistance;
        _this._node.maxDistance = (0, _isDefined2.default)(maxDistance) ? maxDistance : pannerDefaults.maxDistance;
        _this._node.rolloffFactor = (0, _isDefined2.default)(rolloffFactor) ? rolloffFactor : pannerDefaults.rolloffFactor;
        _this._node.coneInnerAngle = (0, _isDefined2.default)(coneInnerAngle) ? coneInnerAngle : pannerDefaults.coneInnerAngle;
        _this._node.coneOuterAngle = (0, _isDefined2.default)(coneOuterAngle) ? coneOuterAngle : pannerDefaults.coneOuterAngle;
        _this._node.coneOuterGain = (0, _isDefined2.default)(coneOuterGain) ? coneOuterGain : pannerDefaults.coneOuterGain;
        // set to defaults (needed in Firefox)
        _this._node.setPosition(0, 0, 0);
        _this._node.setOrientation(1, 0, 0);

        _this.set(0);
        return _this;
    }

    Panner.prototype.update = function update(_ref2) {
        var x = _ref2.x,
            y = _ref2.y,
            z = _ref2.z;

        var v = vecPool.get(x, y, z);

        if ((0, _isSafeNumber2.default)(x) && !(0, _isSafeNumber2.default)(y) && !(0, _isSafeNumber2.default)(z)) {
            // pan left to right with value from -1 to 1
            x = v.x;

            if (x > 1) {
                x = 1;
            }
            if (x < -1) {
                x = -1;
            }

            // creates a nice curve with z
            x = x * angle45;
            z = x + angle90;

            if (z > angle90) {
                z = Math.PI - z;
            }

            v.x = Math.sin(x);
            v.y = 0;
            v.z = Math.sin(z);
        }
        setNodePosition(this._node, v);
    };

    // set the position the audio is coming from)


    Panner.prototype.setPosition = function setPosition(x, y, z) {
        setNodePosition(this._node, vecPool.get(x, y, z));
    };

    // set the direction the audio is coming from)


    Panner.prototype.setOrientation = function setOrientation(x, y, z) {
        setNodeOrientation(this._node, vecPool.get(x, y, z));
    };

    // set the position of who or what is hearing the audio (could be camera or some character)


    Panner.prototype.setListenerPosition = function setListenerPosition(x, y, z) {
        setNodePosition(_sono2.default.context.listener, vecPool.get(x, y, z));
    };

    // set the position of who or what is hearing the audio (could be camera or some character)


    Panner.prototype.setListenerOrientation = function setListenerOrientation(x, y, z) {
        setNodeOrientation(_sono2.default.context.listener, vecPool.get(x, y, z));
    };

    Panner.prototype.set = function set(x, y, z) {
        return this.update({ x: x, y: y, z: z });
    };

    (0, _createClass3.default)(Panner, [{
        key: 'defaults',
        get: function get() {
            return pannerDefaults;
        },
        set: function set(value) {
            Object.assign(pannerDefaults, value);
        }
    }]);
    return Panner;
}(_abstractDirectEffect2.default);

var panner = _sono2.default.register('panner', function (opts) {
    return new Panner(opts);
});

Object.defineProperties(panner, {
    defaults: {
        get: function get() {
            return pannerDefaults;
        },
        set: function set(value) {
            return Object.assign(pannerDefaults, value);
        }
    },
    setListenerPosition: {
        value: function value(x, y, z) {
            return setNodePosition(_sono2.default.context.listener, vecPool.get(x, y, z));
        }
    },
    setListenerOrientation: {
        value: function value(x, y, z) {
            return setNodeOrientation(_sono2.default.context.listener, vecPool.get(x, y, z));
        }
    }
});

exports.default = panner;