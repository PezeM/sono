'use strict';

exports.__esModule = true;

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var halfPI = Math.PI / 2;
var twoPI = Math.PI * 2;

function waveformer(config) {

    var style = config.style || 'fill',
        // 'fill' or 'line'
    shape = config.shape || 'linear',
        // 'circular' or 'linear'
    color = config.color || 0,
        bgColor = config.bgColor,
        lineWidth = config.lineWidth || 1,
        percent = config.percent || 1,
        originX = config.x || 0,
        originY = config.y || 0,
        transform = config.transform;

    var canvas = config.canvas,
        width = config.width || canvas && canvas.width,
        height = config.height || canvas && canvas.height;

    var ctx = null,
        currentColor = void 0,
        i = void 0,
        x = void 0,
        y = void 0,
        radius = void 0,
        innerRadius = void 0,
        centerX = void 0,
        centerY = void 0;

    if (!canvas && !config.context) {
        canvas = document.createElement('canvas');
        width = width || canvas.width;
        height = height || canvas.height;
        canvas.width = width;
        canvas.height = height;
    }

    if (shape === 'circular') {
        radius = config.radius || Math.min(height / 2, width / 2);
        innerRadius = config.innerRadius || radius / 2;
        centerX = originX + width / 2;
        centerY = originY + height / 2;
    }

    ctx = config.context || canvas.getContext('2d');

    function clear() {
        if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(originX, originY, width, height);
        } else {
            ctx.clearRect(originX, originY, width, height);
        }

        ctx.lineWidth = lineWidth;

        currentColor = null;

        if (typeof color !== 'function') {
            ctx.strokeStyle = color;
            ctx.beginPath();
        }
    }

    function updateColor(position, length, value) {
        if (typeof color === 'function') {
            var newColor = color(position, length, value);
            if (newColor !== currentColor) {
                currentColor = newColor;
                ctx.stroke();
                ctx.strokeStyle = currentColor;
                ctx.beginPath();
            }
        }
    }

    function getValue(value, position, length) {
        if (typeof transform === 'function') {
            return transform(value, position, length);
        }
        return value;
    }

    function getWaveform(value, length) {
        if (value && typeof value.waveform === 'function') {
            return value.waveform(length);
        }
        if (value) {
            return value;
        }
        if (config.waveform) {
            return config.waveform;
        }
        if (config.sound) {
            return config.sound.waveform(length);
        }
        return null;
    }

    function update(wave) {

        clear();

        if (shape === 'circular') {
            var waveform = getWaveform(wave, 360);
            var length = Math.floor(waveform.length * percent);

            var step = twoPI / length;
            var angle = void 0,
                magnitude = void 0,
                sine = void 0,
                cosine = void 0;

            for (i = 0; i < length; i++) {
                var value = getValue(waveform[i], i, length);
                updateColor(i, length, value);

                angle = i * step - halfPI;
                cosine = Math.cos(angle);
                sine = Math.sin(angle);

                if (style === 'fill') {
                    x = centerX + innerRadius * cosine;
                    y = centerY + innerRadius * sine;
                    ctx.moveTo(x, y);
                }

                magnitude = innerRadius + (radius - innerRadius) * value;
                x = centerX + magnitude * cosine;
                y = centerY + magnitude * sine;

                if (style === 'line' && i === 0) {
                    ctx.moveTo(x, y);
                }

                ctx.lineTo(x, y);
            }

            if (style === 'line') {
                ctx.closePath();
            }
        } else {

            var _waveform = getWaveform(wave, width);
            var maxX = width - lineWidth / 2;
            var _length = Math.min(_waveform.length, maxX);
            _length = Math.floor(_length * percent);
            var stepX = maxX / _length;

            for (i = 0; i < _length; i++) {
                var _value = getValue(_waveform[i], i, _length);
                updateColor(i, _length, _value);

                if (style === 'line' && i > 0) {
                    ctx.lineTo(x, y);
                }

                x = originX + i * stepX;
                y = originY + height - Math.round(height * _value);
                y = Math.floor(Math.min(y, originY + height - lineWidth / 2));

                if (style === 'fill') {
                    x = Math.ceil(x + lineWidth / 2);
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, originY + height);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();
    }

    update.canvas = canvas;

    if (config.waveform || config.sound) {
        update();
    }

    return update;
}

exports.default = _sono2.default.register('waveformer', waveformer, _sono2.default.utils);