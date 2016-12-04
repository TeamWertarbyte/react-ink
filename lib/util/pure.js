"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Pure;
function Pure(props, state) {
  for (var p in props) {
    if (this.props[p] !== props[p]) return true;
  }

  for (var s in state) {
    if (this.state[s] !== state[s]) return true;
  }

  return false;
}