// stampit.js
function isFunction(obj) {
  return typeof obj === "function";
}
function isObject(obj) {
  return obj && typeof obj === "object" || isFunction(obj);
}
function isPlainObject(value) {
  return value && typeof value === "object" && value.__proto__ === Object.prototype;
}
function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
function getOwnPropertyKeys(obj) {
  return [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];
}
function assignOne(dst, src) {
  if (src) {
    for (const key of getOwnPropertyKeys(src)) {
      const desc = Object.getOwnPropertyDescriptor(src, key);
      Object.defineProperty(dst, key, desc);
    }
  }
  return dst;
}
function mergeOne(dst, src) {
  if (src === void 0) return dst;
  if (Array.isArray(src)) {
    if (Array.isArray(dst)) return [...dst, ...src];
    return [...src];
  }
  if (!isPlainObject(src)) return src;
  for (const key of getOwnPropertyKeys(src)) {
    const desc = Object.getOwnPropertyDescriptor(src, key);
    if (desc.hasOwnProperty("value")) {
      if (desc.value !== void 0) {
        dst[key] = mergeOne(isPlainObject(dst[key]) || Array.isArray(src[key]) ? dst[key] : {}, src[key]);
      }
    } else {
      Object.defineProperty(dst, key, desc);
    }
  }
  return dst;
}
var assign = (dst, ...args) => args.reduce(assignOne, dst);
var merge = (dst, ...args) => args.reduce(mergeOne, dst);
function extractUniqueFunctions(...args) {
  const funcs = new Set(args.flat().filter(isFunction));
  return funcs.size ? [...funcs] : void 0;
}
function createEmptyStamp() {
  return function Stamp(...args) {
    let options = args[0];
    const descriptor = Stamp.compose || {};
    let instance = descriptor.methods ? Object.create(descriptor.methods) : {};
    mergeOne(instance, descriptor.deepProperties);
    assignOne(instance, descriptor.properties);
    if (descriptor.propertyDescriptors) Object.defineProperties(instance, descriptor.propertyDescriptors);
    const inits = descriptor.initializers;
    if (!Array.isArray(inits) || inits.length === 0) return instance;
    if (options === void 0) options = {};
    for (let i = 0, initializer, returnedValue; i < inits.length; ) {
      initializer = inits[i++];
      if (isFunction(initializer)) {
        returnedValue = initializer.call(instance, options, { instance, stamp: Stamp, args });
        instance = returnedValue === void 0 ? instance : returnedValue;
      }
    }
    return instance;
  };
}
function mergeComposable(dstDescriptor, srcComposable) {
  function mergeAssign(propName, action) {
    if (!isObject(srcComposable[propName])) {
      return;
    }
    if (!isObject(dstDescriptor[propName])) {
      dstDescriptor[propName] = {};
    }
    action(dstDescriptor[propName], srcComposable[propName]);
  }
  function concatAssignFunctions(propName) {
    const funcs = extractUniqueFunctions(dstDescriptor[propName], srcComposable[propName]);
    if (funcs) dstDescriptor[propName] = funcs;
  }
  srcComposable = srcComposable?.compose || srcComposable;
  if (isObject(srcComposable)) {
    mergeAssign("methods", assignOne);
    mergeAssign("properties", assignOne);
    mergeAssign("deepProperties", mergeOne);
    mergeAssign("propertyDescriptors", assignOne);
    mergeAssign("staticProperties", assignOne);
    mergeAssign("staticDeepProperties", mergeOne);
    mergeAssign("staticPropertyDescriptors", assignOne);
    mergeAssign("configuration", assignOne);
    mergeAssign("deepConfiguration", mergeOne);
    concatAssignFunctions("initializers");
    concatAssignFunctions("composers");
  }
  return dstDescriptor;
}
function compose(...args) {
  const composables = [this, ...args].filter(isObject);
  let stamp = createEmptyStamp();
  const descriptor = composables.reduce(mergeComposable, {});
  mergeOne(stamp, descriptor.staticDeepProperties);
  assignOne(stamp, descriptor.staticProperties);
  if (descriptor.staticPropertyDescriptors) Object.defineProperties(stamp, descriptor.staticPropertyDescriptors);
  const c = isFunction(stamp.compose) ? stamp.compose : compose;
  stamp.compose = function(...args2) {
    return c(this, ...args2);
  };
  assignOne(stamp.compose, descriptor);
  const composers = descriptor.composers;
  if (Array.isArray(composers)) {
    for (const composer of composers) {
      const composerResult = composer({ stamp, composables });
      stamp = isStamp(composerResult) ? composerResult : stamp;
    }
  }
  return stamp;
}
function standardiseDescriptor(descr) {
  if (!isObject(descr) || isStamp(descr)) return descr;
  const out = {};
  out.methods = descr.methods || void 0;
  const p1 = descr.properties;
  const p2 = descr.props;
  out.properties = isObject(p1 || p2) ? assign({}, p2, p1) : void 0;
  out.initializers = extractUniqueFunctions(descr.init, descr.initializers);
  out.composers = extractUniqueFunctions(descr.composers);
  const dp1 = descr.deepProperties;
  const dp2 = descr.deepProps;
  out.deepProperties = isObject(dp1 || dp2) ? merge({}, dp2, dp1) : void 0;
  out.propertyDescriptors = descr.propertyDescriptors;
  const sp1 = descr.staticProperties;
  const sp2 = descr.statics;
  out.staticProperties = isObject(sp1 || sp2) ? assign({}, sp2, sp1) : void 0;
  const sdp1 = descr.staticDeepProperties;
  const sdp2 = descr.deepStatics;
  out.staticDeepProperties = isObject(sdp1 || sdp2) ? merge({}, sdp2, sdp1) : void 0;
  const spd1 = descr.staticPropertyDescriptors;
  const spd2 = descr.name && { name: { value: descr.name } };
  out.staticPropertyDescriptors = isObject(spd2 || spd1) ? assign({}, spd1, spd2) : void 0;
  const c1 = descr.configuration;
  const c2 = descr.conf;
  out.configuration = isObject(c1 || c2) ? assign({}, c2, c1) : void 0;
  const dc1 = descr.deepConfiguration;
  const dc2 = descr.deepConf;
  out.deepConfiguration = isObject(dc1 || dc2) ? merge({}, dc2, dc1) : void 0;
  return out;
}
var staticUtils = {
  methods(...args) {
    return this.compose({ methods: assign({}, ...args) });
  },
  properties(...args) {
    return this.compose({ properties: assign({}, ...args) });
  },
  initializers(...args) {
    return this.compose({ initializers: extractUniqueFunctions(...args) });
  },
  composers(...args) {
    return this.compose({ composers: extractUniqueFunctions(...args) });
  },
  deepProperties(...args) {
    return this.compose({ deepProperties: merge({}, ...args) });
  },
  staticProperties(...args) {
    return this.compose({ staticProperties: assign({}, ...args) });
  },
  staticDeepProperties(...args) {
    return this.compose({ staticDeepProperties: merge({}, ...args) });
  },
  configuration(...args) {
    return this.compose({ configuration: assign({}, ...args) });
  },
  deepConfiguration(...args) {
    return this.compose({ deepConfiguration: merge({}, ...args) });
  },
  propertyDescriptors(...args) {
    return this.compose({ propertyDescriptors: assign({}, ...args) });
  },
  staticPropertyDescriptors(...args) {
    return this.compose({ staticPropertyDescriptors: assign({}, ...args) });
  },
  create(...args) {
    return this(...args);
  },
  compose: stampit
  // infecting!
};
staticUtils.props = staticUtils.properties;
staticUtils.init = staticUtils.initializers;
staticUtils.deepProps = staticUtils.deepProperties;
staticUtils.statics = staticUtils.staticProperties;
staticUtils.deepStatics = staticUtils.staticDeepProperties;
staticUtils.conf = staticUtils.configuration;
staticUtils.deepConf = staticUtils.deepConfiguration;
function stampit(...args) {
  return compose(this, { staticProperties: staticUtils }, ...args.map(standardiseDescriptor));
}
export {
  stampit as default,
  stampit as "module.exports"
};
