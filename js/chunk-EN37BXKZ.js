import {
  __commonJS
} from "./chunk-XVZR6UTJ.js";

// src/js/oboe-browser.js
var require_oboe_browser = __commonJS({
  "src/js/oboe-browser.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("oboe", [], factory);
      else if (typeof exports === "object")
        exports["oboe"] = factory();
      else
        root["oboe"] = factory();
    })(typeof self !== "undefined" ? self : exports, function() {
      return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          var module2 = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
          };
          modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
          module2.l = true;
          return module2.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports2, name, getter) {
          if (!__webpack_require__.o(exports2, name)) {
            Object.defineProperty(exports2, name, {
              configurable: false,
              enumerable: true,
              get: getter
            });
          }
        };
        __webpack_require__.n = function(module2) {
          var getter = module2 && module2.__esModule ? function getDefault() {
            return module2["default"];
          } : function getModuleExports() {
            return module2;
          };
          __webpack_require__.d(getter, "a", getter);
          return getter;
        };
        __webpack_require__.o = function(object, property) {
          return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 7);
      }([
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return partialComplete;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return compose2;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return attr;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return lazyUnion;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return apply;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return varArgs;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return flip;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return lazyIntersection;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return noop;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return always;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return functor;
          });
          var __WEBPACK_IMPORTED_MODULE_0__lists__ = __webpack_require__(1);
          var partialComplete = varArgs(function(fn, args) {
            var numBoundArgs = args.length;
            return varArgs(function(callArgs) {
              for (var i = 0; i < callArgs.length; i++) {
                args[numBoundArgs + i] = callArgs[i];
              }
              args.length = numBoundArgs + callArgs.length;
              return fn.apply(this, args);
            });
          }), compose = varArgs(function(fns) {
            var fnsList = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["c"])(fns);
            function next(params, curFn) {
              return [apply(params, curFn)];
            }
            return varArgs(function(startParams) {
              return Object(__WEBPACK_IMPORTED_MODULE_0__lists__["f"])(next, startParams, fnsList)[0];
            });
          });
          function compose2(f1, f2) {
            return function() {
              return f1.call(this, f2.apply(this, arguments));
            };
          }
          function attr(key) {
            return function(o) {
              return o[key];
            };
          }
          var lazyUnion = varArgs(function(fns) {
            return varArgs(function(params) {
              var maybeValue;
              for (var i = 0; i < attr("length")(fns); i++) {
                maybeValue = apply(params, fns[i]);
                if (maybeValue) {
                  return maybeValue;
                }
              }
            });
          });
          function apply(args, fn) {
            return fn.apply(void 0, args);
          }
          function varArgs(fn) {
            var numberOfFixedArguments = fn.length - 1, slice = Array.prototype.slice;
            if (numberOfFixedArguments == 0) {
              return function() {
                return fn.call(this, slice.call(arguments));
              };
            } else if (numberOfFixedArguments == 1) {
              return function() {
                return fn.call(this, arguments[0], slice.call(arguments, 1));
              };
            }
            var argsHolder = Array(fn.length);
            return function() {
              for (var i = 0; i < numberOfFixedArguments; i++) {
                argsHolder[i] = arguments[i];
              }
              argsHolder[numberOfFixedArguments] = slice.call(arguments, numberOfFixedArguments);
              return fn.apply(this, argsHolder);
            };
          }
          function flip(fn) {
            return function(a, b) {
              return fn(b, a);
            };
          }
          function lazyIntersection(fn1, fn2) {
            return function(param) {
              return fn1(param) && fn2(param);
            };
          }
          function noop() {
          }
          function always() {
            return true;
          }
          function functor(val) {
            return function() {
              return val;
            };
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return cons;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return head;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return tail;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return arrayAsList;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return list;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return listAsArray;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return map;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return foldR;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return without;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return all;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return applyEach;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return reverseList;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return first;
          });
          var __WEBPACK_IMPORTED_MODULE_0__functional__ = __webpack_require__(0);
          function cons(x, xs) {
            return [x, xs];
          }
          var emptyList = null, head = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["c"])(0), tail = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["c"])(1);
          function arrayAsList(inputArray) {
            return reverseList(inputArray.reduce(Object(__WEBPACK_IMPORTED_MODULE_0__functional__["e"])(cons), emptyList));
          }
          var list = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["k"])(arrayAsList);
          function listAsArray(list2) {
            return foldR(function(arraySoFar, listItem) {
              arraySoFar.unshift(listItem);
              return arraySoFar;
            }, [], list2);
          }
          function map(fn, list2) {
            return list2 ? cons(fn(head(list2)), map(fn, tail(list2))) : emptyList;
          }
          function foldR(fn, startValue, list2) {
            return list2 ? fn(foldR(fn, startValue, tail(list2)), head(list2)) : startValue;
          }
          function foldR1(fn, list2) {
            return tail(list2) ? fn(foldR1(fn, tail(list2)), head(list2)) : head(list2);
          }
          function without(list2, test, removedFn) {
            return withoutInner(list2, removedFn || __WEBPACK_IMPORTED_MODULE_0__functional__["i"]);
            function withoutInner(subList, removedFn2) {
              return subList ? test(head(subList)) ? (removedFn2(head(subList)), tail(subList)) : cons(head(subList), withoutInner(tail(subList), removedFn2)) : emptyList;
            }
          }
          function all(fn, list2) {
            return !list2 || fn(head(list2)) && all(fn, tail(list2));
          }
          function applyEach(fnList, args) {
            if (fnList) {
              head(fnList).apply(null, args);
              applyEach(tail(fnList), args);
            }
          }
          function reverseList(list2) {
            function reverseInner(list3, reversedAlready) {
              if (!list3) {
                return reversedAlready;
              }
              return reverseInner(tail(list3), cons(head(list3), reversedAlready));
            }
            return reverseInner(list2, emptyList);
          }
          function first(test, list2) {
            return list2 && (test(head(list2)) ? head(list2) : first(test, tail(list2)));
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return isOfType;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return len;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return isString;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return defined;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return hasAllProperties;
          });
          var __WEBPACK_IMPORTED_MODULE_0__lists__ = __webpack_require__(1);
          var __WEBPACK_IMPORTED_MODULE_1__functional__ = __webpack_require__(0);
          function isOfType(T, maybeSomething) {
            return maybeSomething && maybeSomething.constructor === T;
          }
          var len = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["c"])("length"), isString = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(isOfType, String);
          function defined(value) {
            return value !== void 0;
          }
          function hasAllProperties(fieldList, o) {
            return o instanceof Object && Object(__WEBPACK_IMPORTED_MODULE_0__lists__["a"])(function(field) {
              return field in o;
            }, fieldList);
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return NODE_OPENED;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return NODE_CLOSED;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return NODE_SWAP;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return NODE_DROP;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return FAIL_EVENT;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return ROOT_NODE_FOUND;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return ROOT_PATH_FOUND;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return HTTP_START;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return STREAM_DATA;
          });
          __webpack_require__.d(__webpack_exports__, "n", function() {
            return STREAM_END;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return ABORTING;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return SAX_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return SAX_VALUE_OPEN;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return SAX_VALUE_CLOSE;
          });
          __webpack_require__.d(__webpack_exports__, "o", function() {
            return errorReport;
          });
          var _S = 1, NODE_OPENED = _S++, NODE_CLOSED = _S++, NODE_SWAP = _S++, NODE_DROP = _S++, FAIL_EVENT = "fail", ROOT_NODE_FOUND = _S++, ROOT_PATH_FOUND = _S++, HTTP_START = "start", STREAM_DATA = "data", STREAM_END = "end", ABORTING = _S++, SAX_KEY = _S++, SAX_VALUE_OPEN = _S++, SAX_VALUE_CLOSE = _S++;
          function errorReport(statusCode, body, error) {
            try {
              var jsonBody = JSON.parse(body);
            } catch (e) {
            }
            return {
              statusCode,
              body,
              jsonBody,
              thrown: error
            };
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return namedNode;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return keyOf;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return nodeOf;
          });
          var __WEBPACK_IMPORTED_MODULE_0__functional__ = __webpack_require__(0);
          function namedNode(key, node) {
            return { key, node };
          }
          var keyOf = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["c"])("key");
          var nodeOf = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["c"])("node");
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return oboe;
          });
          var __WEBPACK_IMPORTED_MODULE_0__lists__ = __webpack_require__(1);
          var __WEBPACK_IMPORTED_MODULE_1__functional__ = __webpack_require__(0);
          var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_3__defaults__ = __webpack_require__(8);
          var __WEBPACK_IMPORTED_MODULE_4__wire__ = __webpack_require__(9);
          function oboe(arg1) {
            var nodeStreamMethodNames = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["h"])("resume", "pause", "pipe"), isStream = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(__WEBPACK_IMPORTED_MODULE_2__util__["b"], nodeStreamMethodNames);
            if (arg1) {
              if (isStream(arg1) || Object(__WEBPACK_IMPORTED_MODULE_2__util__["d"])(arg1)) {
                return Object(__WEBPACK_IMPORTED_MODULE_3__defaults__["a"])(__WEBPACK_IMPORTED_MODULE_4__wire__["a"], arg1);
              } else {
                return Object(__WEBPACK_IMPORTED_MODULE_3__defaults__["a"])(__WEBPACK_IMPORTED_MODULE_4__wire__["a"], arg1.url, arg1.method, arg1.body, arg1.headers, arg1.withCredentials, arg1.cached);
              }
            } else {
              return Object(__WEBPACK_IMPORTED_MODULE_4__wire__["a"])();
            }
          }
          oboe.drop = function() {
            return oboe.drop;
          };
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return incrementalContentBuilder;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return ROOT_PATH;
          });
          var __WEBPACK_IMPORTED_MODULE_0__events__ = __webpack_require__(3);
          var __WEBPACK_IMPORTED_MODULE_1__ascent__ = __webpack_require__(4);
          var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_3__lists__ = __webpack_require__(1);
          var ROOT_PATH = {};
          function incrementalContentBuilder(oboeBus) {
            var emitNodeOpened = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["f"]).emit, emitNodeClosed = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["d"]).emit, emitRootOpened = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["i"]).emit, emitRootClosed = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["h"]).emit;
            function arrayIndicesAreKeys(possiblyInconsistentAscent, newDeepestNode) {
              var parentNode = Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["c"])(Object(__WEBPACK_IMPORTED_MODULE_3__lists__["g"])(possiblyInconsistentAscent));
              return Object(__WEBPACK_IMPORTED_MODULE_2__util__["c"])(Array, parentNode) ? keyFound(possiblyInconsistentAscent, Object(__WEBPACK_IMPORTED_MODULE_2__util__["e"])(parentNode), newDeepestNode) : possiblyInconsistentAscent;
            }
            function nodeOpened(ascent, newDeepestNode) {
              if (!ascent) {
                emitRootOpened(newDeepestNode);
                return keyFound(ascent, ROOT_PATH, newDeepestNode);
              }
              var arrayConsistentAscent = arrayIndicesAreKeys(ascent, newDeepestNode), ancestorBranches = Object(__WEBPACK_IMPORTED_MODULE_3__lists__["l"])(arrayConsistentAscent), previouslyUnmappedName = Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["a"])(Object(__WEBPACK_IMPORTED_MODULE_3__lists__["g"])(arrayConsistentAscent));
              appendBuiltContent(ancestorBranches, previouslyUnmappedName, newDeepestNode);
              return Object(__WEBPACK_IMPORTED_MODULE_3__lists__["d"])(Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["b"])(previouslyUnmappedName, newDeepestNode), ancestorBranches);
            }
            function appendBuiltContent(ancestorBranches, key, node) {
              Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["c"])(Object(__WEBPACK_IMPORTED_MODULE_3__lists__["g"])(ancestorBranches))[key] = node;
            }
            function keyFound(ascent, newDeepestName, maybeNewDeepestNode) {
              if (ascent) {
                appendBuiltContent(ascent, newDeepestName, maybeNewDeepestNode);
              }
              var ascentWithNewPath = Object(__WEBPACK_IMPORTED_MODULE_3__lists__["d"])(Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["b"])(newDeepestName, maybeNewDeepestNode), ascent);
              emitNodeOpened(ascentWithNewPath);
              return ascentWithNewPath;
            }
            function nodeClosed(ascent) {
              emitNodeClosed(ascent);
              return Object(__WEBPACK_IMPORTED_MODULE_3__lists__["l"])(ascent) || emitRootClosed(Object(__WEBPACK_IMPORTED_MODULE_1__ascent__["c"])(Object(__WEBPACK_IMPORTED_MODULE_3__lists__["g"])(ascent)));
            }
            var contentBuilderHandlers = {};
            contentBuilderHandlers[__WEBPACK_IMPORTED_MODULE_0__events__["l"]] = nodeOpened;
            contentBuilderHandlers[__WEBPACK_IMPORTED_MODULE_0__events__["k"]] = nodeClosed;
            contentBuilderHandlers[__WEBPACK_IMPORTED_MODULE_0__events__["j"]] = keyFound;
            return contentBuilderHandlers;
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
          var __WEBPACK_IMPORTED_MODULE_0__publicApi__ = __webpack_require__(5);
          __webpack_exports__["default"] = __WEBPACK_IMPORTED_MODULE_0__publicApi__["a"];
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return applyDefaults;
          });
          var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(2);
          function applyDefaults(passthrough, url, httpMethodName, body, headers, withCredentials, cached) {
            headers = headers ? JSON.parse(JSON.stringify(headers)) : {};
            if (body) {
              if (!Object(__WEBPACK_IMPORTED_MODULE_0__util__["d"])(body)) {
                body = JSON.stringify(body);
                headers["Content-Type"] = headers["Content-Type"] || "application/json";
              }
              headers["Content-Length"] = headers["Content-Length"] || body.length;
            } else {
              body = null;
            }
            function modifiedUrl(baseUrl, cached2) {
              if (cached2 === false) {
                if (baseUrl.indexOf("?") == -1) {
                  baseUrl += "?";
                } else {
                  baseUrl += "&";
                }
                baseUrl += "_=" + new Date().getTime();
              }
              return baseUrl;
            }
            return passthrough(httpMethodName || "GET", modifiedUrl(url, cached), body, headers, withCredentials || false);
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return wire;
          });
          var __WEBPACK_IMPORTED_MODULE_0__pubSub__ = __webpack_require__(10);
          var __WEBPACK_IMPORTED_MODULE_1__ascentManager__ = __webpack_require__(12);
          var __WEBPACK_IMPORTED_MODULE_2__incrementalContentBuilder__ = __webpack_require__(6);
          var __WEBPACK_IMPORTED_MODULE_3__patternAdapter__ = __webpack_require__(13);
          var __WEBPACK_IMPORTED_MODULE_4__jsonPath__ = __webpack_require__(14);
          var __WEBPACK_IMPORTED_MODULE_5__instanceApi__ = __webpack_require__(16);
          var __WEBPACK_IMPORTED_MODULE_6__libs_clarinet__ = __webpack_require__(17);
          var __WEBPACK_IMPORTED_MODULE_7__streamingHttp_node__ = __webpack_require__(18);
          function wire(httpMethodName, contentSource, body, headers, withCredentials) {
            var oboeBus = Object(__WEBPACK_IMPORTED_MODULE_0__pubSub__["a"])();
            if (contentSource) {
              Object(__WEBPACK_IMPORTED_MODULE_7__streamingHttp_node__["b"])(oboeBus, Object(__WEBPACK_IMPORTED_MODULE_7__streamingHttp_node__["a"])(), httpMethodName, contentSource, body, headers, withCredentials);
            }
            Object(__WEBPACK_IMPORTED_MODULE_6__libs_clarinet__["a"])(oboeBus);
            Object(__WEBPACK_IMPORTED_MODULE_1__ascentManager__["a"])(oboeBus, Object(__WEBPACK_IMPORTED_MODULE_2__incrementalContentBuilder__["b"])(oboeBus));
            Object(__WEBPACK_IMPORTED_MODULE_3__patternAdapter__["a"])(oboeBus, __WEBPACK_IMPORTED_MODULE_4__jsonPath__["a"]);
            return Object(__WEBPACK_IMPORTED_MODULE_5__instanceApi__["a"])(oboeBus, contentSource);
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return pubSub;
          });
          var __WEBPACK_IMPORTED_MODULE_0__singleEventPubSub__ = __webpack_require__(11);
          var __WEBPACK_IMPORTED_MODULE_1__functional__ = __webpack_require__(0);
          function pubSub() {
            var singles = {}, newListener = newSingle("newListener"), removeListener = newSingle("removeListener");
            function newSingle(eventName) {
              return singles[eventName] = Object(__WEBPACK_IMPORTED_MODULE_0__singleEventPubSub__["a"])(eventName, newListener, removeListener);
            }
            function pubSubInstance(eventName) {
              return singles[eventName] || newSingle(eventName);
            }
            ["emit", "on", "un"].forEach(function(methodName) {
              pubSubInstance[methodName] = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["k"])(function(eventName, parameters) {
                Object(__WEBPACK_IMPORTED_MODULE_1__functional__["b"])(parameters, pubSubInstance(eventName)[methodName]);
              });
            });
            return pubSubInstance;
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return singleEventPubSub;
          });
          var __WEBPACK_IMPORTED_MODULE_0__lists__ = __webpack_require__(1);
          var __WEBPACK_IMPORTED_MODULE_1__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_2__functional__ = __webpack_require__(0);
          function singleEventPubSub(eventType, newListener, removeListener) {
            var listenerTupleList, listenerList;
            function hasId(id) {
              return function(tuple) {
                return tuple.id == id;
              };
            }
            return {
              on: function(listener, listenerId) {
                var tuple = {
                  listener,
                  id: listenerId || listener
                };
                if (newListener) {
                  newListener.emit(eventType, listener, tuple.id);
                }
                listenerTupleList = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["d"])(tuple, listenerTupleList);
                listenerList = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["d"])(listener, listenerList);
                return this;
              },
              emit: function() {
                Object(__WEBPACK_IMPORTED_MODULE_0__lists__["b"])(listenerList, arguments);
              },
              un: function(listenerId) {
                var removed;
                listenerTupleList = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["m"])(listenerTupleList, hasId(listenerId), function(tuple) {
                  removed = tuple;
                });
                if (removed) {
                  listenerList = Object(__WEBPACK_IMPORTED_MODULE_0__lists__["m"])(listenerList, function(listener) {
                    return listener == removed.listener;
                  });
                  if (removeListener) {
                    removeListener.emit(eventType, removed.listener, removed.id);
                  }
                }
              },
              listeners: function() {
                return listenerList;
              },
              hasListener: function(listenerId) {
                var test = listenerId ? hasId(listenerId) : __WEBPACK_IMPORTED_MODULE_2__functional__["a"];
                return Object(__WEBPACK_IMPORTED_MODULE_1__util__["a"])(Object(__WEBPACK_IMPORTED_MODULE_0__lists__["e"])(test, listenerTupleList));
              }
            };
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return ascentManager;
          });
          var __WEBPACK_IMPORTED_MODULE_0__ascent__ = __webpack_require__(4);
          var __WEBPACK_IMPORTED_MODULE_1__events__ = __webpack_require__(3);
          var __WEBPACK_IMPORTED_MODULE_2__lists__ = __webpack_require__(1);
          function ascentManager(oboeBus, handlers) {
            "use strict";
            var listenerId = {}, ascent;
            function stateAfter(handler) {
              return function(param) {
                ascent = handler(ascent, param);
              };
            }
            for (var eventName in handlers) {
              oboeBus(eventName).on(stateAfter(handlers[eventName]), listenerId);
            }
            oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["g"]).on(function(newNode) {
              var oldHead = Object(__WEBPACK_IMPORTED_MODULE_2__lists__["g"])(ascent), key = Object(__WEBPACK_IMPORTED_MODULE_0__ascent__["a"])(oldHead), ancestors = Object(__WEBPACK_IMPORTED_MODULE_2__lists__["l"])(ascent), parentNode;
              if (ancestors) {
                parentNode = Object(__WEBPACK_IMPORTED_MODULE_0__ascent__["c"])(Object(__WEBPACK_IMPORTED_MODULE_2__lists__["g"])(ancestors));
                parentNode[key] = newNode;
              }
            });
            oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["e"]).on(function() {
              var oldHead = Object(__WEBPACK_IMPORTED_MODULE_2__lists__["g"])(ascent), key = Object(__WEBPACK_IMPORTED_MODULE_0__ascent__["a"])(oldHead), ancestors = Object(__WEBPACK_IMPORTED_MODULE_2__lists__["l"])(ascent), parentNode;
              if (ancestors) {
                parentNode = Object(__WEBPACK_IMPORTED_MODULE_0__ascent__["c"])(Object(__WEBPACK_IMPORTED_MODULE_2__lists__["g"])(ancestors));
                delete parentNode[key];
              }
            });
            oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["a"]).on(function() {
              for (var eventName2 in handlers) {
                oboeBus(eventName2).un(listenerId);
              }
            });
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return patternAdapter;
          });
          var __WEBPACK_IMPORTED_MODULE_0__events__ = __webpack_require__(3);
          var __WEBPACK_IMPORTED_MODULE_1__lists__ = __webpack_require__(1);
          var __WEBPACK_IMPORTED_MODULE_2__ascent__ = __webpack_require__(4);
          function patternAdapter(oboeBus, jsonPathCompiler) {
            var predicateEventMap = {
              node: oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["d"]),
              path: oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["f"])
            };
            function emitMatchingNode(emitMatch, node, ascent) {
              var descent = Object(__WEBPACK_IMPORTED_MODULE_1__lists__["k"])(ascent);
              emitMatch(node, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["i"])(Object(__WEBPACK_IMPORTED_MODULE_1__lists__["l"])(Object(__WEBPACK_IMPORTED_MODULE_1__lists__["j"])(__WEBPACK_IMPORTED_MODULE_2__ascent__["a"], descent))), Object(__WEBPACK_IMPORTED_MODULE_1__lists__["i"])(Object(__WEBPACK_IMPORTED_MODULE_1__lists__["j"])(__WEBPACK_IMPORTED_MODULE_2__ascent__["c"], descent)));
            }
            function addUnderlyingListener(fullEventName, predicateEvent, compiledJsonPath) {
              var emitMatch = oboeBus(fullEventName).emit;
              predicateEvent.on(function(ascent) {
                var maybeMatchingMapping = compiledJsonPath(ascent);
                if (maybeMatchingMapping !== false) {
                  emitMatchingNode(emitMatch, Object(__WEBPACK_IMPORTED_MODULE_2__ascent__["c"])(maybeMatchingMapping), ascent);
                }
              }, fullEventName);
              oboeBus("removeListener").on(function(removedEventName) {
                if (removedEventName == fullEventName) {
                  if (!oboeBus(removedEventName).listeners()) {
                    predicateEvent.un(fullEventName);
                  }
                }
              });
            }
            oboeBus("newListener").on(function(fullEventName) {
              var match = /(node|path):(.*)/.exec(fullEventName);
              if (match) {
                var predicateEvent = predicateEventMap[match[1]];
                if (!predicateEvent.hasListener(fullEventName)) {
                  addUnderlyingListener(fullEventName, predicateEvent, jsonPathCompiler(match[2]));
                }
              }
            });
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return jsonPathCompiler;
          });
          var __WEBPACK_IMPORTED_MODULE_0__functional__ = __webpack_require__(0);
          var __WEBPACK_IMPORTED_MODULE_1__lists__ = __webpack_require__(1);
          var __WEBPACK_IMPORTED_MODULE_2__ascent__ = __webpack_require__(4);
          var __WEBPACK_IMPORTED_MODULE_3__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_4__incrementalContentBuilder__ = __webpack_require__(6);
          var __WEBPACK_IMPORTED_MODULE_5__jsonPathSyntax__ = __webpack_require__(15);
          var jsonPathCompiler = Object(__WEBPACK_IMPORTED_MODULE_5__jsonPathSyntax__["a"])(function(pathNodeSyntax, doubleDotSyntax, dotSyntax, bangSyntax, emptySyntax) {
            var CAPTURING_INDEX = 1;
            var NAME_INDEX = 2;
            var FIELD_LIST_INDEX = 3;
            var headKey = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["d"])(__WEBPACK_IMPORTED_MODULE_2__ascent__["a"], __WEBPACK_IMPORTED_MODULE_1__lists__["g"]), headNode = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["d"])(__WEBPACK_IMPORTED_MODULE_2__ascent__["c"], __WEBPACK_IMPORTED_MODULE_1__lists__["g"]);
            function nameClause(previousExpr, detection) {
              var name = detection[NAME_INDEX], matchesName = !name || name == "*" ? __WEBPACK_IMPORTED_MODULE_0__functional__["a"] : function(ascent) {
                return headKey(ascent) == name;
              };
              return Object(__WEBPACK_IMPORTED_MODULE_0__functional__["g"])(matchesName, previousExpr);
            }
            function duckTypeClause(previousExpr, detection) {
              var fieldListStr = detection[FIELD_LIST_INDEX];
              if (!fieldListStr)
                return previousExpr;
              var hasAllrequiredFields = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["j"])(__WEBPACK_IMPORTED_MODULE_3__util__["b"], Object(__WEBPACK_IMPORTED_MODULE_1__lists__["c"])(fieldListStr.split(/\W+/))), isMatch = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["d"])(hasAllrequiredFields, headNode);
              return Object(__WEBPACK_IMPORTED_MODULE_0__functional__["g"])(isMatch, previousExpr);
            }
            function capture(previousExpr, detection) {
              var capturing = !!detection[CAPTURING_INDEX];
              if (!capturing)
                return previousExpr;
              return Object(__WEBPACK_IMPORTED_MODULE_0__functional__["g"])(previousExpr, __WEBPACK_IMPORTED_MODULE_1__lists__["g"]);
            }
            function skip1(previousExpr) {
              if (previousExpr == __WEBPACK_IMPORTED_MODULE_0__functional__["a"]) {
                return __WEBPACK_IMPORTED_MODULE_0__functional__["a"];
              }
              function notAtRoot(ascent) {
                return headKey(ascent) != __WEBPACK_IMPORTED_MODULE_4__incrementalContentBuilder__["a"];
              }
              return Object(__WEBPACK_IMPORTED_MODULE_0__functional__["g"])(notAtRoot, Object(__WEBPACK_IMPORTED_MODULE_0__functional__["d"])(previousExpr, __WEBPACK_IMPORTED_MODULE_1__lists__["l"]));
            }
            function skipMany(previousExpr) {
              if (previousExpr == __WEBPACK_IMPORTED_MODULE_0__functional__["a"]) {
                return __WEBPACK_IMPORTED_MODULE_0__functional__["a"];
              }
              var terminalCaseWhenArrivingAtRoot = rootExpr(), terminalCaseWhenPreviousExpressionIsSatisfied = previousExpr, recursiveCase = skip1(function(ascent) {
                return cases(ascent);
              }), cases = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["h"])(terminalCaseWhenArrivingAtRoot, terminalCaseWhenPreviousExpressionIsSatisfied, recursiveCase);
              return cases;
            }
            function rootExpr() {
              return function(ascent) {
                return headKey(ascent) == __WEBPACK_IMPORTED_MODULE_4__incrementalContentBuilder__["a"];
              };
            }
            function statementExpr(lastClause) {
              return function(ascent) {
                var exprMatch = lastClause(ascent);
                return exprMatch === true ? Object(__WEBPACK_IMPORTED_MODULE_1__lists__["g"])(ascent) : exprMatch;
              };
            }
            function expressionsReader(exprs, parserGeneratedSoFar, detection) {
              return Object(__WEBPACK_IMPORTED_MODULE_1__lists__["f"])(function(parserGeneratedSoFar2, expr) {
                return expr(parserGeneratedSoFar2, detection);
              }, parserGeneratedSoFar, exprs);
            }
            function generateClauseReaderIfTokenFound(tokenDetector, clauseEvaluatorGenerators, jsonPath, parserGeneratedSoFar, onSuccess) {
              var detected = tokenDetector(jsonPath);
              if (detected) {
                var compiledParser = expressionsReader(clauseEvaluatorGenerators, parserGeneratedSoFar, detected), remainingUnparsedJsonPath = jsonPath.substr(Object(__WEBPACK_IMPORTED_MODULE_3__util__["e"])(detected[0]));
                return onSuccess(remainingUnparsedJsonPath, compiledParser);
              }
            }
            function clauseMatcher(tokenDetector, exprs) {
              return Object(__WEBPACK_IMPORTED_MODULE_0__functional__["j"])(generateClauseReaderIfTokenFound, tokenDetector, exprs);
            }
            var clauseForJsonPath = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["h"])(clauseMatcher(pathNodeSyntax, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["h"])(capture, duckTypeClause, nameClause, skip1)), clauseMatcher(doubleDotSyntax, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["h"])(skipMany)), clauseMatcher(dotSyntax, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["h"])()), clauseMatcher(bangSyntax, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["h"])(capture, rootExpr)), clauseMatcher(emptySyntax, Object(__WEBPACK_IMPORTED_MODULE_1__lists__["h"])(statementExpr)), function(jsonPath) {
              throw Error('"' + jsonPath + '" could not be tokenised');
            });
            function returnFoundParser(_remainingJsonPath, compiledParser) {
              return compiledParser;
            }
            function compileJsonPathToFunction(uncompiledJsonPath, parserGeneratedSoFar) {
              var onFind = uncompiledJsonPath ? compileJsonPathToFunction : returnFoundParser;
              return clauseForJsonPath(uncompiledJsonPath, parserGeneratedSoFar, onFind);
            }
            return function(jsonPath) {
              try {
                return compileJsonPathToFunction(jsonPath, __WEBPACK_IMPORTED_MODULE_0__functional__["a"]);
              } catch (e) {
                throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
              }
            };
          });
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return jsonPathSyntax;
          });
          var __WEBPACK_IMPORTED_MODULE_0__functional__ = __webpack_require__(0);
          var jsonPathSyntax = function() {
            var regexDescriptor = function regexDescriptor2(regex) {
              return regex.exec.bind(regex);
            }, jsonPathClause = Object(__WEBPACK_IMPORTED_MODULE_0__functional__["k"])(function(componentRegexes) {
              componentRegexes.unshift(/^/);
              return regexDescriptor(RegExp(componentRegexes.map(Object(__WEBPACK_IMPORTED_MODULE_0__functional__["c"])("source")).join("")));
            }), possiblyCapturing = /(\$?)/, namedNode = /([\w-_]+|\*)/, namePlaceholder = /()/, nodeInArrayNotation = /\["([^"]+)"\]/, numberedNodeInArrayNotation = /\[(\d+|\*)\]/, fieldList = /{([\w ]*?)}/, optionalFieldList = /(?:{([\w ]*?)})?/, jsonPathNamedNodeInObjectNotation = jsonPathClause(possiblyCapturing, namedNode, optionalFieldList), jsonPathNamedNodeInArrayNotation = jsonPathClause(possiblyCapturing, nodeInArrayNotation, optionalFieldList), jsonPathNumberedNodeInArrayNotation = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation, optionalFieldList), jsonPathPureDuckTyping = jsonPathClause(possiblyCapturing, namePlaceholder, fieldList), jsonPathDoubleDot = jsonPathClause(/\.\./), jsonPathDot = jsonPathClause(/\./), jsonPathBang = jsonPathClause(possiblyCapturing, /!/), emptyString = jsonPathClause(/$/);
            return function(fn) {
              return fn(Object(__WEBPACK_IMPORTED_MODULE_0__functional__["h"])(jsonPathNamedNodeInObjectNotation, jsonPathNamedNodeInArrayNotation, jsonPathNumberedNodeInArrayNotation, jsonPathPureDuckTyping), jsonPathDoubleDot, jsonPathDot, jsonPathBang, emptyString);
            };
          }();
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return instanceApi;
          });
          var __WEBPACK_IMPORTED_MODULE_0__events__ = __webpack_require__(3);
          var __WEBPACK_IMPORTED_MODULE_1__functional__ = __webpack_require__(0);
          var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_3__publicApi__ = __webpack_require__(5);
          function instanceApi(oboeBus, contentSource) {
            var oboeApi, fullyQualifiedNamePattern = /^(node|path):./, rootNodeFinishedEvent = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["h"]), emitNodeDrop = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["e"]).emit, emitNodeSwap = oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["g"]).emit, addListener = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["k"])(function(eventId, parameters) {
              if (oboeApi[eventId]) {
                Object(__WEBPACK_IMPORTED_MODULE_1__functional__["b"])(parameters, oboeApi[eventId]);
              } else {
                var event = oboeBus(eventId), listener = parameters[0];
                if (fullyQualifiedNamePattern.test(eventId)) {
                  addForgettableCallback(event, listener);
                } else {
                  event.on(listener);
                }
              }
              return oboeApi;
            }), removeListener = function(eventId, p2, p3) {
              if (eventId == "done") {
                rootNodeFinishedEvent.un(p2);
              } else if (eventId == "node" || eventId == "path") {
                oboeBus.un(eventId + ":" + p2, p3);
              } else {
                var listener = p2;
                oboeBus(eventId).un(listener);
              }
              return oboeApi;
            };
            function addProtectedCallback(eventName, callback) {
              oboeBus(eventName).on(protectedCallback(callback), callback);
              return oboeApi;
            }
            function addForgettableCallback(event, callback, listenerId) {
              listenerId = listenerId || callback;
              var safeCallback = protectedCallback(callback);
              event.on(function() {
                var discard = false;
                oboeApi.forget = function() {
                  discard = true;
                };
                Object(__WEBPACK_IMPORTED_MODULE_1__functional__["b"])(arguments, safeCallback);
                delete oboeApi.forget;
                if (discard) {
                  event.un(listenerId);
                }
              }, listenerId);
              return oboeApi;
            }
            function protectedCallback(callback) {
              return function() {
                try {
                  return callback.apply(oboeApi, arguments);
                } catch (e) {
                  setTimeout(function() {
                    throw new Error(e.message);
                  });
                }
              };
            }
            function fullyQualifiedPatternMatchEvent(type, pattern) {
              return oboeBus(type + ":" + pattern);
            }
            function wrapCallbackToSwapNodeIfSomethingReturned(callback) {
              return function() {
                var returnValueFromCallback = callback.apply(this, arguments);
                if (Object(__WEBPACK_IMPORTED_MODULE_2__util__["a"])(returnValueFromCallback)) {
                  if (returnValueFromCallback == __WEBPACK_IMPORTED_MODULE_3__publicApi__["a"].drop) {
                    emitNodeDrop();
                  } else {
                    emitNodeSwap(returnValueFromCallback);
                  }
                }
              };
            }
            function addSingleNodeOrPathListener(eventId, pattern, callback) {
              var effectiveCallback;
              if (eventId == "node") {
                effectiveCallback = wrapCallbackToSwapNodeIfSomethingReturned(callback);
              } else {
                effectiveCallback = callback;
              }
              addForgettableCallback(fullyQualifiedPatternMatchEvent(eventId, pattern), effectiveCallback, callback);
            }
            function addMultipleNodeOrPathListeners(eventId, listenerMap) {
              for (var pattern in listenerMap) {
                addSingleNodeOrPathListener(eventId, pattern, listenerMap[pattern]);
              }
            }
            function addNodeOrPathListenerApi(eventId, jsonPathOrListenerMap, callback) {
              if (Object(__WEBPACK_IMPORTED_MODULE_2__util__["d"])(jsonPathOrListenerMap)) {
                addSingleNodeOrPathListener(eventId, jsonPathOrListenerMap, callback);
              } else {
                addMultipleNodeOrPathListeners(eventId, jsonPathOrListenerMap);
              }
              return oboeApi;
            }
            oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["i"]).on(function(rootNode) {
              oboeApi.root = Object(__WEBPACK_IMPORTED_MODULE_1__functional__["f"])(rootNode);
            });
            oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["c"]).on(function(_statusCode, headers) {
              oboeApi.header = function(name) {
                return name ? headers[name] : headers;
              };
            });
            return oboeApi = {
              on: addListener,
              addListener,
              removeListener,
              emit: oboeBus.emit,
              node: Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(addNodeOrPathListenerApi, "node"),
              path: Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(addNodeOrPathListenerApi, "path"),
              done: Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(addForgettableCallback, rootNodeFinishedEvent),
              start: Object(__WEBPACK_IMPORTED_MODULE_1__functional__["j"])(addProtectedCallback, __WEBPACK_IMPORTED_MODULE_0__events__["c"]),
              fail: oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["b"]).on,
              abort: oboeBus(__WEBPACK_IMPORTED_MODULE_0__events__["a"]).emit,
              header: __WEBPACK_IMPORTED_MODULE_1__functional__["i"],
              root: __WEBPACK_IMPORTED_MODULE_1__functional__["i"],
              source: contentSource
            };
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return clarinet;
          });
          var __WEBPACK_IMPORTED_MODULE_0__events__ = __webpack_require__(3);
          function clarinet(eventBus) {
            "use strict";
            var emitSaxKey = eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["j"]).emit, emitValueOpen = eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["l"]).emit, emitValueClose = eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["k"]).emit, emitFail = eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["b"]).emit, MAX_BUFFER_LENGTH = 64 * 1024, stringTokenPattern = /[\\"\n]/g, _n = 0, BEGIN = _n++, VALUE = _n++, OPEN_OBJECT = _n++, CLOSE_OBJECT = _n++, OPEN_ARRAY = _n++, CLOSE_ARRAY = _n++, STRING = _n++, OPEN_KEY = _n++, CLOSE_KEY = _n++, TRUE = _n++, TRUE2 = _n++, TRUE3 = _n++, FALSE = _n++, FALSE2 = _n++, FALSE3 = _n++, FALSE4 = _n++, NULL = _n++, NULL2 = _n++, NULL3 = _n++, NUMBER_DECIMAL_POINT = _n++, NUMBER_DIGIT = _n, bufferCheckPosition = MAX_BUFFER_LENGTH, latestError, c, p, textNode = void 0, numberNode = "", slashed = false, closed = false, state = BEGIN, stack = [], unicodeS = null, unicodeI = 0, depth = 0, position = 0, column = 0, line = 1;
            function checkBufferLength() {
              var maxActual = 0;
              if (textNode !== void 0 && textNode.length > MAX_BUFFER_LENGTH) {
                emitError("Max buffer length exceeded: textNode");
                maxActual = Math.max(maxActual, textNode.length);
              }
              if (numberNode.length > MAX_BUFFER_LENGTH) {
                emitError("Max buffer length exceeded: numberNode");
                maxActual = Math.max(maxActual, numberNode.length);
              }
              bufferCheckPosition = MAX_BUFFER_LENGTH - maxActual + position;
            }
            eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["m"]).on(handleData);
            eventBus(__WEBPACK_IMPORTED_MODULE_0__events__["n"]).on(handleStreamEnd);
            function emitError(errorString) {
              if (textNode !== void 0) {
                emitValueOpen(textNode);
                emitValueClose();
                textNode = void 0;
              }
              latestError = Error(errorString + "\nLn: " + line + "\nCol: " + column + "\nChr: " + c);
              emitFail(Object(__WEBPACK_IMPORTED_MODULE_0__events__["o"])(void 0, void 0, latestError));
            }
            function handleStreamEnd() {
              if (state == BEGIN) {
                emitValueOpen({});
                emitValueClose();
                closed = true;
                return;
              }
              if (state !== VALUE || depth !== 0)
                emitError("Unexpected end");
              if (textNode !== void 0) {
                emitValueOpen(textNode);
                emitValueClose();
                textNode = void 0;
              }
              closed = true;
            }
            function whitespace(c2) {
              return c2 == "\r" || c2 == "\n" || c2 == " " || c2 == "	";
            }
            function handleData(chunk) {
              if (latestError)
                return;
              if (closed) {
                return emitError("Cannot write after close");
              }
              var i = 0;
              c = chunk[0];
              while (c) {
                if (i > 0) {
                  p = c;
                }
                c = chunk[i++];
                if (!c)
                  break;
                position++;
                if (c == "\n") {
                  line++;
                  column = 0;
                } else
                  column++;
                switch (state) {
                  case BEGIN:
                    if (c === "{")
                      state = OPEN_OBJECT;
                    else if (c === "[")
                      state = OPEN_ARRAY;
                    else if (!whitespace(c))
                      return emitError("Non-whitespace before {[.");
                    continue;
                  case OPEN_KEY:
                  case OPEN_OBJECT:
                    if (whitespace(c))
                      continue;
                    if (state === OPEN_KEY)
                      stack.push(CLOSE_KEY);
                    else {
                      if (c === "}") {
                        emitValueOpen({});
                        emitValueClose();
                        state = stack.pop() || VALUE;
                        continue;
                      } else
                        stack.push(CLOSE_OBJECT);
                    }
                    if (c === '"')
                      state = STRING;
                    else
                      return emitError('Malformed object key should start with " ');
                    continue;
                  case CLOSE_KEY:
                  case CLOSE_OBJECT:
                    if (whitespace(c))
                      continue;
                    if (c === ":") {
                      if (state === CLOSE_OBJECT) {
                        stack.push(CLOSE_OBJECT);
                        if (textNode !== void 0) {
                          emitValueOpen({});
                          emitSaxKey(textNode);
                          textNode = void 0;
                        }
                        depth++;
                      } else {
                        if (textNode !== void 0) {
                          emitSaxKey(textNode);
                          textNode = void 0;
                        }
                      }
                      state = VALUE;
                    } else if (c === "}") {
                      if (textNode !== void 0) {
                        emitValueOpen(textNode);
                        emitValueClose();
                        textNode = void 0;
                      }
                      emitValueClose();
                      depth--;
                      state = stack.pop() || VALUE;
                    } else if (c === ",") {
                      if (state === CLOSE_OBJECT)
                        stack.push(CLOSE_OBJECT);
                      if (textNode !== void 0) {
                        emitValueOpen(textNode);
                        emitValueClose();
                        textNode = void 0;
                      }
                      state = OPEN_KEY;
                    } else
                      return emitError("Bad object");
                    continue;
                  case OPEN_ARRAY:
                  case VALUE:
                    if (whitespace(c))
                      continue;
                    if (state === OPEN_ARRAY) {
                      emitValueOpen([]);
                      depth++;
                      state = VALUE;
                      if (c === "]") {
                        emitValueClose();
                        depth--;
                        state = stack.pop() || VALUE;
                        continue;
                      } else {
                        stack.push(CLOSE_ARRAY);
                      }
                    }
                    if (c === '"')
                      state = STRING;
                    else if (c === "{")
                      state = OPEN_OBJECT;
                    else if (c === "[")
                      state = OPEN_ARRAY;
                    else if (c === "t")
                      state = TRUE;
                    else if (c === "f")
                      state = FALSE;
                    else if (c === "n")
                      state = NULL;
                    else if (c === "-") {
                      numberNode += c;
                    } else if (c === "0") {
                      numberNode += c;
                      state = NUMBER_DIGIT;
                    } else if ("123456789".indexOf(c) !== -1) {
                      numberNode += c;
                      state = NUMBER_DIGIT;
                    } else
                      return emitError("Bad value");
                    continue;
                  case CLOSE_ARRAY:
                    if (c === ",") {
                      stack.push(CLOSE_ARRAY);
                      if (textNode !== void 0) {
                        emitValueOpen(textNode);
                        emitValueClose();
                        textNode = void 0;
                      }
                      state = VALUE;
                    } else if (c === "]") {
                      if (textNode !== void 0) {
                        emitValueOpen(textNode);
                        emitValueClose();
                        textNode = void 0;
                      }
                      emitValueClose();
                      depth--;
                      state = stack.pop() || VALUE;
                    } else if (whitespace(c))
                      continue;
                    else
                      return emitError("Bad array");
                    continue;
                  case STRING:
                    if (textNode === void 0) {
                      textNode = "";
                    }
                    var starti = i - 1;
                    STRING_BIGLOOP:
                      while (true) {
                        while (unicodeI > 0) {
                          unicodeS += c;
                          c = chunk.charAt(i++);
                          if (unicodeI === 4) {
                            textNode += String.fromCharCode(parseInt(unicodeS, 16));
                            unicodeI = 0;
                            starti = i - 1;
                          } else {
                            unicodeI++;
                          }
                          if (!c)
                            break STRING_BIGLOOP;
                        }
                        if (c === '"' && !slashed) {
                          state = stack.pop() || VALUE;
                          textNode += (" " + chunk.substring(starti, i - 1)).substr(1);
                          break;
                        }
                        if (c === "\\" && !slashed) {
                          slashed = true;
                          textNode += (" " + chunk.substring(starti, i - 1)).substr(1);
                          c = chunk.charAt(i++);
                          if (!c)
                            break;
                        }
                        if (slashed) {
                          slashed = false;
                          if (c === "n") {
                            textNode += "\n";
                          } else if (c === "r") {
                            textNode += "\r";
                          } else if (c === "t") {
                            textNode += "	";
                          } else if (c === "f") {
                            textNode += "\f";
                          } else if (c === "b") {
                            textNode += "\b";
                          } else if (c === "u") {
                            unicodeI = 1;
                            unicodeS = "";
                          } else {
                            textNode += c;
                          }
                          c = chunk.charAt(i++);
                          starti = i - 1;
                          if (!c)
                            break;
                          else
                            continue;
                        }
                        stringTokenPattern.lastIndex = i;
                        var reResult = stringTokenPattern.exec(chunk);
                        if (!reResult) {
                          i = chunk.length + 1;
                          textNode += (" " + chunk.substring(starti, i - 1)).substr(1);
                          break;
                        }
                        i = reResult.index + 1;
                        c = chunk.charAt(reResult.index);
                        if (!c) {
                          textNode += (" " + chunk.substring(starti, i - 1)).substr(1);
                          break;
                        }
                      }
                    continue;
                  case TRUE:
                    if (!c)
                      continue;
                    if (c === "r")
                      state = TRUE2;
                    else
                      return emitError("Invalid true started with t" + c);
                    continue;
                  case TRUE2:
                    if (!c)
                      continue;
                    if (c === "u")
                      state = TRUE3;
                    else
                      return emitError("Invalid true started with tr" + c);
                    continue;
                  case TRUE3:
                    if (!c)
                      continue;
                    if (c === "e") {
                      emitValueOpen(true);
                      emitValueClose();
                      state = stack.pop() || VALUE;
                    } else
                      return emitError("Invalid true started with tru" + c);
                    continue;
                  case FALSE:
                    if (!c)
                      continue;
                    if (c === "a")
                      state = FALSE2;
                    else
                      return emitError("Invalid false started with f" + c);
                    continue;
                  case FALSE2:
                    if (!c)
                      continue;
                    if (c === "l")
                      state = FALSE3;
                    else
                      return emitError("Invalid false started with fa" + c);
                    continue;
                  case FALSE3:
                    if (!c)
                      continue;
                    if (c === "s")
                      state = FALSE4;
                    else
                      return emitError("Invalid false started with fal" + c);
                    continue;
                  case FALSE4:
                    if (!c)
                      continue;
                    if (c === "e") {
                      emitValueOpen(false);
                      emitValueClose();
                      state = stack.pop() || VALUE;
                    } else
                      return emitError("Invalid false started with fals" + c);
                    continue;
                  case NULL:
                    if (!c)
                      continue;
                    if (c === "u")
                      state = NULL2;
                    else
                      return emitError("Invalid null started with n" + c);
                    continue;
                  case NULL2:
                    if (!c)
                      continue;
                    if (c === "l")
                      state = NULL3;
                    else
                      return emitError("Invalid null started with nu" + c);
                    continue;
                  case NULL3:
                    if (!c)
                      continue;
                    if (c === "l") {
                      emitValueOpen(null);
                      emitValueClose();
                      state = stack.pop() || VALUE;
                    } else
                      return emitError("Invalid null started with nul" + c);
                    continue;
                  case NUMBER_DECIMAL_POINT:
                    if (c === ".") {
                      numberNode += c;
                      state = NUMBER_DIGIT;
                    } else
                      return emitError("Leading zero not followed by .");
                    continue;
                  case NUMBER_DIGIT:
                    if ("0123456789".indexOf(c) !== -1)
                      numberNode += c;
                    else if (c === ".") {
                      if (numberNode.indexOf(".") !== -1)
                        return emitError("Invalid number has two dots");
                      numberNode += c;
                    } else if (c === "e" || c === "E") {
                      if (numberNode.indexOf("e") !== -1 || numberNode.indexOf("E") !== -1)
                        return emitError("Invalid number has two exponential");
                      numberNode += c;
                    } else if (c === "+" || c === "-") {
                      if (!(p === "e" || p === "E"))
                        return emitError("Invalid symbol in number");
                      numberNode += c;
                    } else {
                      if (numberNode) {
                        emitValueOpen(parseFloat(numberNode));
                        emitValueClose();
                        numberNode = "";
                      }
                      i--;
                      state = stack.pop() || VALUE;
                    }
                    continue;
                  default:
                    return emitError("Unknown state: " + state);
                }
              }
              if (position >= bufferCheckPosition)
                checkBufferLength();
            }
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return httpTransport;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return streamingHttp;
          });
          var __WEBPACK_IMPORTED_MODULE_0__detectCrossOrigin_browser__ = __webpack_require__(19);
          var __WEBPACK_IMPORTED_MODULE_1__events__ = __webpack_require__(3);
          var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(2);
          var __WEBPACK_IMPORTED_MODULE_3__parseResponseHeaders_browser__ = __webpack_require__(20);
          var __WEBPACK_IMPORTED_MODULE_4__functional__ = __webpack_require__(0);
          function httpTransport() {
            return new XMLHttpRequest();
          }
          function streamingHttp(oboeBus, xhr, method, url, data, headers, withCredentials) {
            "use strict";
            var emitStreamData = oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["m"]).emit, emitFail = oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["b"]).emit, numberOfCharsAlreadyGivenToCallback = 0, stillToSendStartEvent = true;
            oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["a"]).on(function() {
              xhr.onreadystatechange = null;
              xhr.abort();
            });
            function handleProgress() {
              var textSoFar = xhr.responseText, newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);
              if (newText) {
                emitStreamData(newText);
              }
              numberOfCharsAlreadyGivenToCallback = Object(__WEBPACK_IMPORTED_MODULE_2__util__["e"])(textSoFar);
            }
            if ("onprogress" in xhr) {
              xhr.onprogress = handleProgress;
            }
            xhr.onreadystatechange = function() {
              function sendStartIfNotAlready() {
                try {
                  stillToSendStartEvent && oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["c"]).emit(xhr.status, Object(__WEBPACK_IMPORTED_MODULE_3__parseResponseHeaders_browser__["a"])(xhr.getAllResponseHeaders()));
                  stillToSendStartEvent = false;
                } catch (e) {
                }
              }
              switch (xhr.readyState) {
                case 2:
                case 3:
                  return sendStartIfNotAlready();
                case 4:
                  sendStartIfNotAlready();
                  var successful = String(xhr.status)[0] == 2;
                  if (successful) {
                    handleProgress();
                    oboeBus(__WEBPACK_IMPORTED_MODULE_1__events__["n"]).emit();
                  } else {
                    emitFail(Object(__WEBPACK_IMPORTED_MODULE_1__events__["o"])(xhr.status, xhr.responseText));
                  }
              }
            };
            try {
              xhr.open(method, url, true);
              for (var headerName in headers) {
                xhr.setRequestHeader(headerName, headers[headerName]);
              }
              if (!Object(__WEBPACK_IMPORTED_MODULE_0__detectCrossOrigin_browser__["a"])(window.location, Object(__WEBPACK_IMPORTED_MODULE_0__detectCrossOrigin_browser__["b"])(url))) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
              }
              xhr.withCredentials = withCredentials;
              xhr.send(data);
            } catch (e) {
              window.setTimeout(Object(__WEBPACK_IMPORTED_MODULE_4__functional__["j"])(emitFail, Object(__WEBPACK_IMPORTED_MODULE_1__events__["o"])(void 0, void 0, e)), 0);
            }
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return isCrossOrigin;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return parseUrlOrigin;
          });
          function isCrossOrigin(pageLocation, ajaxHost) {
            function defaultPort(protocol) {
              return { "http:": 80, "https:": 443 }[protocol];
            }
            function portOf(location) {
              return location.port || defaultPort(location.protocol || pageLocation.protocol);
            }
            return !!(ajaxHost.protocol && ajaxHost.protocol != pageLocation.protocol || ajaxHost.host && ajaxHost.host != pageLocation.host || ajaxHost.host && portOf(ajaxHost) != portOf(pageLocation));
          }
          function parseUrlOrigin(url) {
            var URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/, urlHostMatch = URL_HOST_PATTERN.exec(url) || [];
            return {
              protocol: urlHostMatch[1] || "",
              host: urlHostMatch[2] || "",
              port: urlHostMatch[3] || ""
            };
          }
        },
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return parseResponseHeaders;
          });
          function parseResponseHeaders(headerStr) {
            var headers = {};
            headerStr && headerStr.split("\r\n").forEach(function(headerPair) {
              var index = headerPair.indexOf(": ");
              headers[headerPair.substring(0, index)] = headerPair.substring(index + 2);
            });
            return headers;
          }
        }
      ])["default"];
    });
  }
});

export {
  require_oboe_browser
};
/*!
 * v2.1.4-40-g295d630
 * 
 */
