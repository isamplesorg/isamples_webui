// src/js/eventbus.js
function EventBus() {
  this.listeners = {};
  this.registerListener = function(event, callback, number) {
    const _type = event.constructor.name;
    number = this.validateNumber(number || "any");
    if (_type !== "Array") {
      event = [event];
    }
    event.forEach(function(e) {
      if (e.constructor.name !== "String") {
        throw new Error("Only `String` and array of `String` are accepted for the event names!");
      }
      that.listeners[e] = that.listeners[e] || [];
      that.listeners[e].push({
        callback,
        number
      });
    });
  };
  this.validateNumber = function(n) {
    const _type = n.constructor.name;
    if (_type === "Number") {
      return n;
    } else if (_type === "String" && n.toLowerCase() === "any") {
      return "any";
    }
    throw new Error("Only `Number` and `any` are accepted in the number of possible executions!");
  };
  this.toBeRemoved = function(info) {
    const number = info.number;
    info.execution = info.execution || 0;
    info.execution++;
    if (number === "any" || info.execution < number) {
      return false;
    }
    return true;
  };
  let that = this;
  return {
    on: function(eventName, callback) {
      that.registerListener.bind(that)(eventName, callback, "any");
    },
    once: function(eventName, callback) {
      that.registerListener.bind(that)(eventName, callback, 1);
    },
    exactly: function(number, eventName, callback) {
      that.registerListener.bind(that)(eventName, callback, number);
    },
    die: function(eventName) {
      delete that.listeners[eventName];
    },
    off: function(eventName) {
      this.die(eventName);
    },
    detach: function(eventName, callback) {
      if (callback === void 0) {
        that.listeners[eventName] = [];
        return true;
      }
      for (let k in that.listeners[eventName]) {
        if (that.listeners[eventName].hasOwnProperty(k) && that.listeners[eventName][k].callback === callback) {
          that.listeners[eventName].splice(k, 1);
          return this.detach(eventName, callback);
        }
      }
      return true;
    },
    detachAll: function() {
      for (let eventName in that.listeners) {
        if (that.listeners.hasOwnProperty(eventName)) {
          this.detach(eventName);
        }
      }
    },
    emit: function(eventName, context) {
      let listeners = [];
      for (let name in that.listeners) {
        if (that.listeners.hasOwnProperty(name)) {
          if (name === eventName) {
            Array.prototype.push.apply(listeners, that.listeners[name]);
          }
          if (name.indexOf("*") >= 0) {
            let newName = name.replace(/\*\*/, "([^.]+.?)+");
            newName = newName.replace(/\*/g, "[^.]+");
            let match = eventName.match(newName);
            if (match && eventName === match[0]) {
              Array.prototype.push.apply(listeners, that.listeners[name]);
            }
          }
        }
      }
      let parentArgs = arguments;
      context = context || this;
      listeners.forEach(function(info, index) {
        let callback = info.callback;
        const number = info.number;
        if (context) {
          callback = callback.bind(context);
        }
        let args = [];
        Object.keys(parentArgs).map(function(i) {
          if (i > 1) {
            args.push(parentArgs[i]);
          }
        });
        if (that.toBeRemoved(info)) {
          that.listeners[eventName].splice(index, 1);
        }
        callback.apply(null, args);
      });
    }
  };
}

export {
  EventBus
};
