'use strict';

var easing = require('./easing');
var SQRT_2 = Math.sqrt(2);
var cos = Math.cos,
    max = Math.max,
    min = Math.min;


function getPress(blot) {
  return min(blot.duration, Date.now() - blot.mouseDown);
}

function getRelease(blot) {
  return blot.mouseUp > 0 ? Date.now() - blot.mouseUp : 0;
}

function getRadius(blot) {
  var duration = blot.duration,
      radius = blot.radius;


  var down = easing(getPress(blot), 0, radius, duration) * 0.85;
  var up = easing(getRelease(blot), 0, radius, duration) * 0.15;
  var undulation = radius * 0.02 * cos(Date.now() / duration);

  return max(0, down + up + undulation);
}

module.exports = {
  getMaxRadius: function getMaxRadius(height, width, radius) {
    return min(max(height, width) * 0.5, radius);
  },
  getBlotOpacity: function getBlotOpacity(blot, opacity) {
    return easing(getRelease(blot), opacity, -opacity, blot.duration);
  },
  getBlotOuterOpacity: function getBlotOuterOpacity(blot, opacity) {
    return min(this.getBlotOpacity(blot, opacity), easing(getPress(blot), 0, 0.3, blot.duration * 3));
  },
  getBlotShiftX: function getBlotShiftX(blot, size, width) {
    return min(1, getRadius(blot) / size * 2 / SQRT_2) * (width / 2 - blot.x);
  },
  getBlotShiftY: function getBlotShiftY(blot, size, height) {
    return min(1, getRadius(blot) / size * 2 / SQRT_2) * (height / 2 - blot.y);
  },
  getBlotScale: function getBlotScale(blot) {
    return getRadius(blot) / blot.radius;
  }
};