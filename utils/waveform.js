'use strict';

exports.__esModule = true;

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function waveform() {
    var buffer = void 0,
        wave = void 0;

    return function (audioBuffer, length) {
        if (!window.Float32Array || !window.AudioBuffer) {
            return [];
        }

        var sameBuffer = buffer === audioBuffer;
        var sameLength = wave && wave.length === length;
        if (sameBuffer && sameLength) {
            return wave;
        }

        wave = new Float32Array(length);

        if (!audioBuffer) {
            return wave;
        }

        // cache for repeated calls
        buffer = audioBuffer;

        var chunk = Math.floor(buffer.length / length),
            resolution = 5,
            // 10
        incr = Math.max(Math.floor(chunk / resolution), 1);
        var greatest = 0;

        for (var i = 0; i < buffer.numberOfChannels; i++) {
            // check each channel
            var channel = buffer.getChannelData(i);
            for (var j = 0; j < length; j++) {
                // get highest value within the chunk
                for (var k = j * chunk, l = k + chunk; k < l; k += incr) {
                    // select highest value from channels
                    var a = channel[k];
                    if (a < 0) {
                        a = -a;
                    }
                    if (a > wave[j]) {
                        wave[j] = a;
                    }
                    // update highest overall for scaling
                    if (a > greatest) {
                        greatest = a;
                    }
                }
            }
        }
        // scale up
        var scale = 1 / greatest;
        for (var _i = 0; _i < wave.length; _i++) {
            wave[_i] *= scale;
        }

        return wave;
    };
}

exports.default = _sono2.default.register('waveform', waveform, _sono2.default.utils);