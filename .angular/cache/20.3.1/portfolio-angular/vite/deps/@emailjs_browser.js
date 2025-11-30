import {
  __async,
  __name,
  __spreadValues
} from "./chunk-TJFVSI2U.js";

// node_modules/@emailjs/browser/es/models/EmailJSResponseStatus.js
var _EmailJSResponseStatus = class _EmailJSResponseStatus {
  constructor(_status = 0, _text = "Network Error") {
    this.status = _status;
    this.text = _text;
  }
};
__name(_EmailJSResponseStatus, "EmailJSResponseStatus");
var EmailJSResponseStatus = _EmailJSResponseStatus;

// node_modules/@emailjs/browser/es/utils/createWebStorage/createWebStorage.js
var createWebStorage = /* @__PURE__ */ __name(() => {
  if (typeof localStorage === "undefined")
    return;
  return {
    get: /* @__PURE__ */ __name((key) => Promise.resolve(localStorage.getItem(key)), "get"),
    set: /* @__PURE__ */ __name((key, value) => Promise.resolve(localStorage.setItem(key, value)), "set"),
    remove: /* @__PURE__ */ __name((key) => Promise.resolve(localStorage.removeItem(key)), "remove")
  };
}, "createWebStorage");

// node_modules/@emailjs/browser/es/store/store.js
var store = {
  origin: "https://api.emailjs.com",
  blockHeadless: false,
  storageProvider: createWebStorage()
};

// node_modules/@emailjs/browser/es/utils/buildOptions/buildOptions.js
var buildOptions = /* @__PURE__ */ __name((options) => {
  if (!options)
    return {};
  if (typeof options === "string") {
    return {
      publicKey: options
    };
  }
  if (options.toString() === "[object Object]") {
    return options;
  }
  return {};
}, "buildOptions");

// node_modules/@emailjs/browser/es/methods/init/init.js
var init = /* @__PURE__ */ __name((options, origin = "https://api.emailjs.com") => {
  if (!options)
    return;
  const opts = buildOptions(options);
  store.publicKey = opts.publicKey;
  store.blockHeadless = opts.blockHeadless;
  store.storageProvider = opts.storageProvider;
  store.blockList = opts.blockList;
  store.limitRate = opts.limitRate;
  store.origin = opts.origin || origin;
}, "init");

// node_modules/@emailjs/browser/es/api/sendPost.js
var sendPost = /* @__PURE__ */ __name((_0, _1, ..._2) => __async(null, [_0, _1, ..._2], function* (url, data, headers = {}) {
  const response = yield fetch(store.origin + url, {
    method: "POST",
    headers,
    body: data
  });
  const message = yield response.text();
  const responseStatus = new EmailJSResponseStatus(response.status, message);
  if (response.ok) {
    return responseStatus;
  }
  throw responseStatus;
}), "sendPost");

// node_modules/@emailjs/browser/es/utils/validateParams/validateParams.js
var validateParams = /* @__PURE__ */ __name((publicKey, serviceID, templateID) => {
  if (!publicKey || typeof publicKey !== "string") {
    throw "The public key is required. Visit https://dashboard.emailjs.com/admin/account";
  }
  if (!serviceID || typeof serviceID !== "string") {
    throw "The service ID is required. Visit https://dashboard.emailjs.com/admin";
  }
  if (!templateID || typeof templateID !== "string") {
    throw "The template ID is required. Visit https://dashboard.emailjs.com/admin/templates";
  }
}, "validateParams");

// node_modules/@emailjs/browser/es/utils/validateTemplateParams/validateTemplateParams.js
var validateTemplateParams = /* @__PURE__ */ __name((templateParams) => {
  if (templateParams && templateParams.toString() !== "[object Object]") {
    throw "The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/";
  }
}, "validateTemplateParams");

// node_modules/@emailjs/browser/es/utils/isHeadless/isHeadless.js
var isHeadless = /* @__PURE__ */ __name((navigator2) => {
  return navigator2.webdriver || !navigator2.languages || navigator2.languages.length === 0;
}, "isHeadless");

// node_modules/@emailjs/browser/es/errors/headlessError/headlessError.js
var headlessError = /* @__PURE__ */ __name(() => {
  return new EmailJSResponseStatus(451, "Unavailable For Headless Browser");
}, "headlessError");

// node_modules/@emailjs/browser/es/utils/validateBlockListParams/validateBlockListParams.js
var validateBlockListParams = /* @__PURE__ */ __name((list, watchVariable) => {
  if (!Array.isArray(list)) {
    throw "The BlockList list has to be an array";
  }
  if (typeof watchVariable !== "string") {
    throw "The BlockList watchVariable has to be a string";
  }
}, "validateBlockListParams");

// node_modules/@emailjs/browser/es/utils/isBlockedValueInParams/isBlockedValueInParams.js
var isBlockListDisabled = /* @__PURE__ */ __name((options) => {
  return !options.list?.length || !options.watchVariable;
}, "isBlockListDisabled");
var getValue = /* @__PURE__ */ __name((data, name) => {
  return data instanceof FormData ? data.get(name) : data[name];
}, "getValue");
var isBlockedValueInParams = /* @__PURE__ */ __name((options, params) => {
  if (isBlockListDisabled(options))
    return false;
  validateBlockListParams(options.list, options.watchVariable);
  const value = getValue(params, options.watchVariable);
  if (typeof value !== "string")
    return false;
  return options.list.includes(value);
}, "isBlockedValueInParams");

// node_modules/@emailjs/browser/es/errors/blockedEmailError/blockedEmailError.js
var blockedEmailError = /* @__PURE__ */ __name(() => {
  return new EmailJSResponseStatus(403, "Forbidden");
}, "blockedEmailError");

// node_modules/@emailjs/browser/es/utils/validateLimitRateParams/validateLimitRateParams.js
var validateLimitRateParams = /* @__PURE__ */ __name((throttle, id) => {
  if (typeof throttle !== "number" || throttle < 0) {
    throw "The LimitRate throttle has to be a positive number";
  }
  if (id && typeof id !== "string") {
    throw "The LimitRate ID has to be a non-empty string";
  }
}, "validateLimitRateParams");

// node_modules/@emailjs/browser/es/utils/isLimitRateHit/isLimitRateHit.js
var getLeftTime = /* @__PURE__ */ __name((id, throttle, storage) => __async(null, null, function* () {
  const lastTime = Number((yield storage.get(id)) || 0);
  return throttle - Date.now() + lastTime;
}), "getLeftTime");
var isLimitRateHit = /* @__PURE__ */ __name((defaultID, options, storage) => __async(null, null, function* () {
  if (!options.throttle || !storage) {
    return false;
  }
  validateLimitRateParams(options.throttle, options.id);
  const id = options.id || defaultID;
  const leftTime = yield getLeftTime(id, options.throttle, storage);
  if (leftTime > 0) {
    return true;
  }
  yield storage.set(id, Date.now().toString());
  return false;
}), "isLimitRateHit");

// node_modules/@emailjs/browser/es/errors/limitRateError/limitRateError.js
var limitRateError = /* @__PURE__ */ __name(() => {
  return new EmailJSResponseStatus(429, "Too Many Requests");
}, "limitRateError");

// node_modules/@emailjs/browser/es/methods/send/send.js
var send = /* @__PURE__ */ __name((serviceID, templateID, templateParams, options) => __async(null, null, function* () {
  const opts = buildOptions(options);
  const publicKey = opts.publicKey || store.publicKey;
  const blockHeadless = opts.blockHeadless || store.blockHeadless;
  const storageProvider = opts.storageProvider || store.storageProvider;
  const blockList = __spreadValues(__spreadValues({}, store.blockList), opts.blockList);
  const limitRate = __spreadValues(__spreadValues({}, store.limitRate), opts.limitRate);
  if (blockHeadless && isHeadless(navigator)) {
    return Promise.reject(headlessError());
  }
  validateParams(publicKey, serviceID, templateID);
  validateTemplateParams(templateParams);
  if (templateParams && isBlockedValueInParams(blockList, templateParams)) {
    return Promise.reject(blockedEmailError());
  }
  if (yield isLimitRateHit(location.pathname, limitRate, storageProvider)) {
    return Promise.reject(limitRateError());
  }
  const params = {
    lib_version: "4.4.1",
    user_id: publicKey,
    service_id: serviceID,
    template_id: templateID,
    template_params: templateParams
  };
  return sendPost("/api/v1.0/email/send", JSON.stringify(params), {
    "Content-type": "application/json"
  });
}), "send");

// node_modules/@emailjs/browser/es/utils/validateForm/validateForm.js
var validateForm = /* @__PURE__ */ __name((form) => {
  if (!form || form.nodeName !== "FORM") {
    throw "The 3rd parameter is expected to be the HTML form element or the style selector of the form";
  }
}, "validateForm");

// node_modules/@emailjs/browser/es/methods/sendForm/sendForm.js
var findHTMLForm = /* @__PURE__ */ __name((form) => {
  return typeof form === "string" ? document.querySelector(form) : form;
}, "findHTMLForm");
var sendForm = /* @__PURE__ */ __name((serviceID, templateID, form, options) => __async(null, null, function* () {
  const opts = buildOptions(options);
  const publicKey = opts.publicKey || store.publicKey;
  const blockHeadless = opts.blockHeadless || store.blockHeadless;
  const storageProvider = store.storageProvider || opts.storageProvider;
  const blockList = __spreadValues(__spreadValues({}, store.blockList), opts.blockList);
  const limitRate = __spreadValues(__spreadValues({}, store.limitRate), opts.limitRate);
  if (blockHeadless && isHeadless(navigator)) {
    return Promise.reject(headlessError());
  }
  const currentForm = findHTMLForm(form);
  validateParams(publicKey, serviceID, templateID);
  validateForm(currentForm);
  const formData = new FormData(currentForm);
  if (isBlockedValueInParams(blockList, formData)) {
    return Promise.reject(blockedEmailError());
  }
  if (yield isLimitRateHit(location.pathname, limitRate, storageProvider)) {
    return Promise.reject(limitRateError());
  }
  formData.append("lib_version", "4.4.1");
  formData.append("service_id", serviceID);
  formData.append("template_id", templateID);
  formData.append("user_id", publicKey);
  return sendPost("/api/v1.0/email/send-form", formData);
}), "sendForm");

// node_modules/@emailjs/browser/es/index.js
var es_default = {
  init,
  send,
  sendForm,
  EmailJSResponseStatus
};
export {
  EmailJSResponseStatus,
  es_default as default,
  init,
  send,
  sendForm
};
//# sourceMappingURL=@emailjs_browser.js.map
