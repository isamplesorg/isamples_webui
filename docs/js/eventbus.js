/**
 * From: https://github.com/bcerati/js-event-bus/blob/f7c96cd6c2569d597fe5bb42b2fa7f852db31685/src/index.js
 *
 * Wrapped in module form here. Changed var to let/const, few typos.
 */
function EventBus() {
    this.listeners = {};

    this.registerListener = function(event, callback, number) {
      const _type = event.constructor.name;
      number = this.validateNumber(number || 'any');

      if (_type !== 'Array') {
        event = [event];
      }

      event.forEach(function(e) {
        if (e.constructor.name !== 'String') {
          throw new Error(
            'Only `String` and array of `String` are accepted for the event names!'
          );
        }

        that.listeners[e] = that.listeners[e] || [];
        that.listeners[e].push({
          callback: callback,
          number: number,
        });
      });
    };

    // valiodate that the number is a valid number for the number of executions
    this.validateNumber = function(n) {
      const _type = n.constructor.name;

      if (_type === 'Number') {
        return n;
      } else if (_type === 'String' && n.toLowerCase() === 'any') {
        return 'any';
      }

      throw new Error(
        'Only `Number` and `any` are accepted in the number of possible executions!'
      );
    };

    // return whether or not this event needs to be removed
    this.toBeRemoved = function(info) {
      const number = info.number;
      info.execution = info.execution || 0;
      info.execution++;

      if (number === 'any' || info.execution < number) {
        return false;
      }

      return true;
    };

    let that = this;
    return {
      /**
       * Attach a callback to an event
       * @param {string} eventName - name of the event.
       * @param {function} callback - callback executed when this event is triggered
       */
      on: function(eventName, callback) {
        that.registerListener.bind(that)(eventName, callback, 'any');
      },

      /**
       * Attach a callback to an event. This callback will not be executed more than once if the event is trigger mutiple times
       * @param {string} eventName - name of the event.
       * @param {function} callback - callback executed when this event is triggered
       */
      once: function(eventName, callback) {
        that.registerListener.bind(that)(eventName, callback, 1);
      },

      /**
       * Attach a callback to an event. This callback will be executed will not be executed more than the number if the event is trigger mutiple times
       * @param {number} number - max number of executions
       * @param {string} eventName - name of the event.
       * @param {function} callback - callback executed when this event is triggered
       */
      exactly: function(number, eventName, callback) {
        that.registerListener.bind(that)(eventName, callback, number);
      },

      /**
       * Kill an event with all it's callbacks
       * @param {string} eventName - name of the event.
       */
      die: function(eventName) {
        delete that.listeners[eventName];
      },

      /**
       * Kill an event with all it's callbacks
       * @param {string} eventName - name of the event.
       */
      off: function(eventName) {
        this.die(eventName);
      },

      /**
       * Remove the callback for the given event
       * @param {string} eventName - name of the event.
       * @param {callback} callback - the callback to remove (undefined to remove all of them).
       */
      detach: function(eventName, callback) {
        if (callback === undefined) {
          that.listeners[eventName] = [];
          return true;
        }

        for (let k in that.listeners[eventName]) {
          if (
            that.listeners[eventName].hasOwnProperty(k) &&
            that.listeners[eventName][k].callback === callback
          ) {
            that.listeners[eventName].splice(k, 1);
            return this.detach(eventName, callback);
          }
        }

        return true;
      },

      /**
       * Remove all the events
       */
      detachAll: function() {
        for (let eventName in that.listeners) {
          if (that.listeners.hasOwnProperty(eventName)) {
            this.detach(eventName);
          }
        }
      },

      /**
       * Emit the event
       * @param {string} eventName - name of the event.
       */
      emit: function(eventName, context) {
        let listeners = [];
        for (let name in that.listeners) {
          if (that.listeners.hasOwnProperty(name)) {
            if (name === eventName) {
              //TODO: this lib should definitely use > ES5
              Array.prototype.push.apply(listeners, that.listeners[name]);
            }

            if (name.indexOf('*') >= 0) {
              let newName = name.replace(/\*\*/, '([^.]+.?)+');
              newName = newName.replace(/\*/g, '[^.]+');

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

          // this event cannot be fired again, remove from the stack
          if (that.toBeRemoved(info)) {
            that.listeners[eventName].splice(index, 1);
          }

          callback.apply(null, args);
        });
      },
    };
  };

export {EventBus}