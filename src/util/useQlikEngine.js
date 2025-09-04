// 전역 단일 설정
const QLIK_CONFIG = {
    baseUrl: "https://dev.jsct.site/ticket/resources",
    host: "dev.jsct.site",
    prefix: "/ticket/",
    isSecure: true,
    port: 443
  };
  
  // 동적 설정 주입
  export function setQlikConfig(cfg = {}) {
    Object.assign(QLIK_CONFIG, cfg);
  }
  
  let qlikReady = null;
  const appPool = new Map();           // appId -> app 인스턴스
  const pendingApps = new Map();       // appId -> 연결 중 Promise
  const evalCache = new Map();         // "appId::expr" -> { num, text, t }
  const DEFAULT_TTL = 5000;            // 계산식 결과 캐시 TTL - ms
  
  function ensureQlikLoaded() {
    if (qlikReady) return qlikReady;
    qlikReady = new Promise((resolve, reject) => {
      const requirejs = window.require;
      if (!requirejs) return reject(new Error("RequireJS not found on window"));
      requirejs.config({
        baseUrl: QLIK_CONFIG.baseUrl,
        paths: { qlik: "js/qlik" }
      });
      requirejs(["js/qlik"], qlik => resolve(qlik));
    });
    return qlikReady;
  }
  
  export async function getApp(appId) {
    if (appPool.has(appId)) return appPool.get(appId);
    if (pendingApps.has(appId)) return pendingApps.get(appId);
  
    const p = (async () => {
      const qlik = await ensureQlikLoaded();
      const app = qlik.openApp(appId, {
        host: QLIK_CONFIG.host,
        prefix: QLIK_CONFIG.prefix,
        isSecure: QLIK_CONFIG.isSecure,
        port: QLIK_CONFIG.port
      });
      appPool.set(appId, app);
      pendingApps.delete(appId);
      return app;
    })();
  
    pendingApps.set(appId, p);
    return p;
  }
  function normalizeExpr(expr) {
    const s = String(expr || "").trim();
    return s.startsWith("=") ? s : "=" + s;
  }
  export async function evaluateEx(appId, expression) {
    const app = await getApp(appId);
    const m = app?.model?.enigmaModel || app?.model;
    if (!m?.evaluate) throw new Error("enigmaModel.evaluate not available");
    const qExpression = normalizeExpr(expression);
    const text = await m.evaluate(qExpression);
    return text ?? "";
  }
  export async function evalExprViaHypercube(appId, expr) {
    const app = await getApp(appId);              // appId로 App 핸들 확보
    const qDef = normalizeExpr(expr);
  
    const obj = await app.createGenericObject({
      qInfo: { qType: "exprEval" },
      qHyperCubeDef: {
        qMeasures: [{ qDef: { qDef } }],
        qInitialDataFetch: [{ qTop: 0, qLeft: 0, qHeight: 1, qWidth: 1 }]
      }
    });
  
    const layout = await obj.getLayout();
    const cell =
      layout.qHyperCube.qGrandTotalRow?.[0] ??
      layout.qHyperCube.qDataPages?.[0]?.qMatrix?.[0]?.[0];
  
    // 세션 오브젝트 정리 (메모리 누수 방지)
    try { await app.destroySessionObject(obj.id); } catch {}
  
    return {
      text: cell?.qText ?? "",
      num: Number.isFinite(cell?.qNum) ? cell.qNum : null
    };
  }
  

  export async function evaluateMany(appId, expressions = [], opts) {
    return Promise.all(expressions.map(e => evaluateEx(appId, e, opts)));
  }
  
  // Mashup - 게시된 오브젝트 마운트
  // 반환: { close: Function }
  export async function mountObject(appId, objId, domTarget, options) {
    const app = await getApp(appId);
    const el = typeof domTarget === "string" ? document.getElementById(domTarget) : domTarget;
    if (!el) throw new Error("mountObject: target element not found");
  
    // host element style guard
    const cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    el.style.padding = "0";
  
    // getObject only
    await app.getObject(el, objId, options);
    return {
      // getObject는 핸들을 반환하지 않으므로 DOM 정리만 제공
      close: () => { try { el.innerHTML = ""; } catch {} }
    };
  }
  
  
  // 보조 유틸
  export async function resize() {
    const qlik = await ensureQlikLoaded();
    try { qlik.resize && qlik.resize(); } catch {}
  }
  
  export async function selectValues(appId, fieldName, values = [], toggle = false) {
    const app = await getApp(appId);
    const field = app.field(fieldName);
    return field.selectValues(values, toggle);
  }
  
  export async function clearAll(appId) {
    const app = await getApp(appId);
    return app.clearAll();
  }
  
  export async function setVariable(appId, name, value) {
    const app = await getApp(appId);
    if (typeof value === "number") {
      return app.variable.setNumValue(name, value);
    }
    return app.variable.setStringValue(name, String(value));
  }
  
  // 필요 시 App 연결 제거
  export function dropApp(appId) {
    appPool.delete(appId);
  }
  