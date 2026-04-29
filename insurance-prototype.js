// 全局状态
var recordedNodes = [];
var sessionStart = Date.now();
var screenshotCount = 0;
var nodeCount = 0;
var pageCount = 1;
var currentAgreementName = "";

function currentTime() {
  var d = new Date();
  var h = String(d.getHours()).padStart(2, "0");
  var m = String(d.getMinutes()).padStart(2, "0");
  var s = String(d.getSeconds()).padStart(2, "0");
  return h + ":" + m + ":" + s;
}

// 视图切换
function switchView(view, el) {
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) views[i].classList.remove("active");
  document.getElementById("view-" + view).classList.add("active");
  var tabs = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
  if (el) el.classList.add("active");
  if (view === "admin") renderAdminTimeline();
  if (view === "mindmap") setTimeout(renderMindMap, 100);
}

// 页面导航
function goPage(pageId) {
  var pages = document.querySelectorAll(".page");
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove("active");
  document.getElementById(pageId).classList.add("active");
  pageCount++;
  var el = document.getElementById("statPages");
  if (el) el.textContent = pageCount;
  recordNodeInternal("page_enter", "进入页面：" + pageId.replace("page-", ""), false);
}

// 核心：记录节点
function recordNodeInternal(type, desc, needScreenshot) {
  var node = {
    type: type,
    desc: desc,
    time: new Date(),
    timeStr: currentTime(),
    hasScreenshot: needScreenshot
  };
  recordedNodes.push(node);
  nodeCount++;
  if (needScreenshot) screenshotCount++;
  showToast(type, desc, needScreenshot);
  if (needScreenshot) simulateScreenshot();
  appendLog(node);
  updateStats();
}

// 截图闪光
function simulateScreenshot() {
  var flash = document.getElementById("captureFlash");
  flash.classList.add("active");
  setTimeout(function() { flash.classList.remove("active"); }, 200);
}

// Toast
function showToast(type, desc, hasScreenshot) {
  var toast = document.getElementById("nodeToast");
  document.getElementById("toastTitle").textContent = "节点已记录";
  var html = "<div>操作：" + desc + "</div>";
  html += "<div>时间：" + currentTime() + "</div>";
  if (hasScreenshot) html += "<div style='color:#FF9800;margin-top:4px;'>已截图（模拟）</div>";
  document.getElementById("toastContent").innerHTML = html;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2500);
}

// 日志面板
function appendLog(node) {
  var panel = document.getElementById("logPanel");
  var line = document.createElement("div");
  line.className = "log-line";
  line.innerHTML = "<span class='log-time'>[" + node.timeStr + "]</span> [" + node.type + "] " + node.desc + (node.hasScreenshot ? " 📷" : "");
  panel.insertBefore(line, panel.firstChild);
}

// 更新统计
function updateStats() {
  var elNodes = document.getElementById("statNodes");
  var elScreenshots = document.getElementById("statScreenshots");
  var elDuration = document.getElementById("statDuration");
  if (elNodes) elNodes.textContent = nodeCount;
  if (elScreenshots) elScreenshots.textContent = screenshotCount;
  if (elDuration) {
    var duration = Math.round((Date.now() - sessionStart) / 1000);
    var min = Math.floor(duration / 60);
    var sec = duration % 60;
    elDuration.textContent = min > 0 ? min + "m" + sec + "s" : sec + "s";
  }
}

// 输入框记录
function recordInput(el, fieldName) {
  if (el.value) {
    recordNodeInternal("input_field", "填写字段：" + fieldName + " = " + el.value.substring(0, 6) + "***", false);
  }
}

// 确认提示页
function toggleConfirmBtn() {
  var checked = document.getElementById("agreeRecord").checked;
  document.getElementById("confirmNoticeBtn").disabled = !checked;
}

// 下一步：从填写信息页进入条款页
function goToAgreement() {
  recordNodeInternal("go_agreement", "进入条款阅读页面（含表单页截图）", true);
  setTimeout(function() { goPage("page-agreement"); }, 800);
}

// 客户告知书弹窗
function openClientNotice() {
  recordNodeInternal("click_buy", "点击立即投保", false);
  recordNodeInternal("view_client_notice", "查看客户告知书弹窗", false);
  document.getElementById("agreeClientNotice").checked = false;
  document.getElementById("confirmClientNoticeBtn").disabled = true;
  document.getElementById("clientNoticeOverlay").classList.add("show");
}

function closeClientNotice() {
  document.getElementById("clientNoticeOverlay").classList.remove("show");
}

function toggleClientNoticeBtn() {
  document.getElementById("confirmClientNoticeBtn").disabled = !document.getElementById("agreeClientNotice").checked;
}

function confirmClientNotice() {
  recordNodeInternal("confirm_client_notice", "确认已阅读客户告知书", true);
  closeClientNotice();
  setTimeout(function() { goPage("page-notice"); }, 600);
}

// 投保提示确认
function confirmNotice() {
  recordNodeInternal("confirm_notice", "确认进入投保流程", true);
  setTimeout(function() { goPage("page-form"); }, 800);
}

// 条款查看
function openAgreement(name) {
  currentAgreementName = name;
  recordNodeInternal("view_agreement", "查看条款：" + name, false);
  document.getElementById("agreementTitle").textContent = name;
  document.getElementById("agreementContent").innerHTML = getAgreementContent(name);
  document.getElementById("agreeCurrent").checked = false;
  document.getElementById("agreementConfirmBtn").disabled = true;
  document.getElementById("agreementOverlay").classList.add("show");
}

function closeAgreement() {
  document.getElementById("agreementOverlay").classList.remove("show");
}

function toggleAgreementConfirm() {
  document.getElementById("agreementConfirmBtn").disabled = !document.getElementById("agreeCurrent").checked;
}

function confirmAgreement() {
  recordNodeInternal("confirm_agreement_detail", "确认已阅读：" + currentAgreementName, true);
  closeAgreement();
}

function checkAgreements() {
  document.getElementById("confirmAgreementBtn").disabled = !document.getElementById("agreeAll").checked;
}

function confirmAgreements() {
  recordNodeInternal("confirm_agreement", "确认已阅读所有条款", true);
  setTimeout(function() { goPage("page-done"); }, 800);
}

function getAgreementContent(name) {
  var contents = {
    "客户告知书": "<h4>客户告知书</h4><p>尊敬的客户：</p><p>感谢您选择XX财产保险股份有限公司的保险产品。</p><p>根据监管规定，特此告知以下内容：</p><p>1. 本公司系依法设立的保险公司，具备经营保险业务的合法资质。</p><p>2. 本保险产品由XX财产保险股份有限公司承保，全国服务热线：400-XXX-XXXX。</p><p>3. 请您仔细阅读保险条款，特别是免除保险公司责任条款。</p><p>4. 您有权在犹豫期内（如有）申请撤销保险合同。</p><p>5. 如发生保险事故，请及时拨打报案电话：400-XXX-XXXX。</p><p style='margin-top:20px;color:#999;'>（以下为模拟内容，实际以保险公司官方条款为准）</p>",
    "保险条款（主条款）": "<h4>保险条款</h4><p><strong>第一条 保险合同构成</strong></p><p>本保险合同由保险条款、投保单、保险单、批单及其他书面协议构成。</p><p><strong>第二条 保险责任</strong></p><p>在保险期间内，被保险人在旅行期间因意外伤害事故导致身故、伤残的，本公司按约定给付保险金。</p><p><strong>第三条 责任免除</strong></p><p>因下列原因造成被保险人身故、伤残的，本公司不承担给付保险金责任，详见《免除责任条款》。</p><p style='margin-top:20px;color:#999;'>（以下为模拟内容，实际以保险公司官方条款为准）</p>",
    "免除保险公司责任条款": "<h4 style='color:#E53935;'>免除保险公司责任条款</h4><p style='color:#E53935;font-weight:600;margin-bottom:12px;'>以下内容为免除保险公司责任的条款，请仔细阅读：</p><p>1. 投保人、被保险人或受益人的故意行为造成的损失；</p><p>2. 被保险人从事高风险运动（如攀岩、跳伞、潜水等）期间发生的事故，除非已额外投保；</p><p>3. 被保险人醉酒或受毒品、管制药物影响期间发生的事故；</p><p>4. 战争、军事冲突、暴乱或武装叛乱；</p><p>5. 核爆炸、核辐射或核污染；</p><p>6. 被保险人未遵守医生建议、或未遵医嘱擅自用药；</p><p>7. 先天性疾病、遗传性疾病。</p><p style='margin-top:20px;color:#999;'>（以下为模拟内容，实际以保险公司官方条款为准）</p>",
    "健康告知书": "<h4>健康告知书</h4><p style='font-weight:600;margin-bottom:12px;'>请如实填写以下健康告知内容，未尽如实告知义务可能影响您的理赔权益。</p><p><strong>1. 您是否曾患有或被告知患有以下疾病：</strong></p><p style='margin-left:16px;'>□ 恶性肿瘤 &nbsp;&nbsp; □ 心脑血管疾病 &nbsp;&nbsp; □ 糖尿病 &nbsp;&nbsp; □ 精神疾病</p><p><strong>2. 您是否正在接受医疗检查或治疗？</strong></p><p><strong>3. 您是否有过住院史或手术史？</strong></p><p><strong>4. 女性被保人：是否怀孕或备孕？</strong></p><p><strong>5. 近一年内是否有过体检异常？</strong></p><p style='margin-top:20px;color:#E53935;'>温馨提示：不如实告知可能导致保险合同无效或影响理赔，请务必如实填写。</p>"
  };
  return contents[name] || "<p>条款内容加载中...</p>";
}

// 完成投保
function finishPurchase() {
  recordNodeInternal("purchase_done", "投保完成，生成保单", true);
}

// 重置演示
function resetDemo() {
  recordedNodes = [];
  nodeCount = 0;
  screenshotCount = 0;
  pageCount = 1;
  sessionStart = Date.now();
  document.getElementById("logPanel").innerHTML = "<div class='log-line'><span class='log-time'>[等待操作]</span> 请在左侧页面中操作...</div>";
  updateStats();
  var el = document.getElementById("statPages");
  if (el) el.textContent = "1";
  goPage("page-product");
}

// 管理端时间线
function renderAdminTimeline() {
  var timeline = document.getElementById("adminTimeline");
  var nodes = [
    { time: "14:32:08", type: "payment", title: "完成支付", desc: "用户完成保费支付，支付金额¥299，支付方式：微信支付", screenshot: true },
    { time: "14:31:52", type: "confirm_apply", title: "点击确认投保", desc: "用户在确认投保页面点击\"确认投保并支付\"按钮", screenshot: true },
    { time: "14:31:30", type: "confirm_agreement", title: "确认已阅读所有条款", desc: "用户确认已阅读：保险条款、免除责任条款、健康告知", screenshot: true },
    { time: "14:30:45", type: "view_agreement", title: "查看：免除保险公司责任条款", desc: "用户在单独页面查看免除责任条款，阅读时长：38秒", screenshot: false },
    { time: "14:30:10", type: "view_agreement", title: "查看：保险条款（主条款）", desc: "用户在单独页面查看保险条款主条款，阅读时长：32秒", screenshot: false },
    { time: "14:29:40", type: "input_field", title: "填写投保信息", desc: "用户填写被保险人姓名、身份证号、出行日期等字段（共6个字段）", screenshot: false },
    { time: "14:29:00", type: "confirm_notice", title: "确认进入投保流程", desc: "用户阅读投保提示后确认进入投保流程（监管强制节点）", screenshot: true },
    { time: "14:28:50", type: "confirm_client_notice", title: "确认客户告知书", desc: "用户在客户告知书弹窗中确认已阅读（截图）", screenshot: true },
    { time: "14:28:40", type: "view_client_notice", title: "查看客户告知书", desc: "用户点击立即投保后弹出客户告知书弹窗（仅记录，不截图）", screenshot: false },
    { time: "14:28:30", type: "click_buy", title: "点击立即投保", desc: "用户从产品详情页点击\"立即投保\"按钮（仅记录，不截图）", screenshot: false },
    { time: "14:27:15", type: "enter_page", title: "进入产品详情页", desc: "用户进入安心游境外旅行险（豪华版）详情页", screenshot: false }
  ];
  var html = "";
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var dotClass = n.screenshot ? "screenshot" : "recorded";
    html += "<div class='timeline-item'>";
    html += "<div class='timeline-dot " + dotClass + "'></div>";
    html += "<div class='timeline-content'>";
    html += "<div class='timeline-time'>" + n.time + "</div>";
    html += "<div class='timeline-title'>" + n.title + "</div>";
    html += "<div style='font-size:13px;color:#757575;margin-bottom:6px;'>" + n.desc + "</div>";
    html += "<div>";
    html += "<span class='timeline-badge badge-time'>" + n.time + "</span>";
    if (n.screenshot) html += "<span class='timeline-badge badge-screenshot'>已截图</span>";
    html += "<span class='timeline-badge badge-page'>节点类型：" + n.type + "</span>";
    html += "</div>";
    if (n.screenshot) {
      html += "<div class='timeline-screenshot' onclick=\"showPreview('" + n.title + "','" + n.time + "')\">";
      html += "<div class='screenshot-placeholder'>点击查看截图：" + n.title + "</div>";
      html += "<div class='screenshot-label'>记录时间：" + n.time + " ｜ 点击查看完整截图</div>";
      html += "</div>";
    }
    html += "</div></div>";
  }
  timeline.innerHTML = html;
}

// 截图预览
function showPreview(title, time) {
  document.getElementById("previewHeader").textContent = "截图预览 — " + title + "（记录时间：" + time + "）";
  document.getElementById("previewBody").innerHTML =
    "<div style='font-size:13px;color:#999;margin-bottom:16px;'>页面截图模拟 ｜ 记录时间：" + time + " ｜ 用户：张***</div>" +
    "<div style='background:#F5F5F5;border-radius:8px;padding:24px;margin-bottom:16px;'>" +
    "<div style='font-size:18px;font-weight:600;margin-bottom:12px;'>" + title + "</div>" +
    "<div style='font-size:14px;line-height:2;color:#333;'>(此处为实际页面截图内容)<br>截图将完整还原用户当时的操作界面<br>包括页面内容、滚动位置、已填字段等</div>" +
    "</div>" +
    "<div style='font-size:11px;color:#999;border-top:1px solid #E0E0E0;padding-top:12px;'>可回溯记录 ｜ 银保监发〔2020〕26号 ｜ 保存期限：≥5年 ｜ 截图序号：#001</div>";
  document.getElementById("screenshotPreview").classList.add("show");
}

function closePreview() {
  document.getElementById("screenshotPreview").classList.remove("show");
}

// 思维导图渲染
function renderMindMap() {
  var g = document.getElementById("mindmapGroup");
  if (!g || g.children.length > 0) return;

  var W = 1100;
  var cx = W / 2;

  var nodes = [
    { id:"root",    x:cx-60,  y:20,   w:120, h:44, type:"root",       label:"开始投保" },
    { id:"buy",     x:60,      y:110,  w:140, h:40, type:"record",     label:"点击立即投保" },
    { id:"notice",  x:cx+80,  y:110,  w:160, h:40, type:"mixed",      label:"客户告知书" },
    { id:"form",    x:30,      y:220,  w:160, h:40, type:"screenshot", label:"填写投保信息" },
    { id:"tip",     x:cx+60,  y:220,  w:180, h:40, type:"screenshot", label:"投保提示页" },
    { id:"agree",   x:60,      y:330,  w:160, h:40, type:"mixed",      label:"阅读保险条款" },
    { id:"confirm", x:cx+80,  y:330,  w:180, h:40, type:"screenshot", label:"确认投保信息" },
    { id:"pay",     x:cx-75,  y:450,  w:150, h:40, type:"screenshot", label:"支付保费" },
    { id:"done",    x:cx-60,  y:560,  w:120, h:44, type:"done",       label:"投保完成" }
  ];

  var edges = [
    { from:"root", to:"buy",    type:"record" },
    { from:"root", to:"notice",  type:"mixed" },
    { from:"buy",  to:"form",   type:"screenshot" },
    { from:"notice", to:"tip",  type:"screenshot" },
    { from:"form", to:"agree",   type:"mixed" },
    { from:"tip",  to:"agree",  type:"screenshot" },
    { from:"agree", to:"confirm", type:"screenshot" },
    { from:"confirm", to:"pay", type:"screenshot" },
    { from:"pay",  to:"done",   type:"screenshot" }
  ];

  var colors = {
    root:       {bg:"#E53935", text:"white", border:"#AB000D"},
    screenshot: {bg:"#E3F2FD", text:"#1565C0", border:"#2196F3"},
    record:     {bg:"#FFF3E0", text:"#E65100", border:"#FF9800"},
    mixed:      {bg:"#F3E5F5", text:"#6A1B9A", border:"#9C27B0"},
    done:       {bg:"#E8F5E9", text:"#2E7D32", border:"#4CAF50"}
  };

  // 画连线
  for (var i = 0; i < edges.length; i++) {
    var e = edges[i];
    var from = null, to = null;
    for (var j = 0; j < nodes.length; j++) { if (nodes[j].id === e.from) from = nodes[j]; if (nodes[j].id === e.to) to = nodes[j]; }
    if (!from || !to) continue;
    var x1 = from.x + from.w/2;
    var y1 = from.y + from.h;
    var x2 = to.x + to.w/2;
    var y2 = to.y;
    var isDashed = (e.type === "record");
    var strokeColor = e.type === "screenshot" ? "#2196F3" : e.type === "mixed" ? "#9C27B0" : "#FF9800";
    var markerColor = e.type === "screenshot" ? "Blue" : e.type === "mixed" ? "Orange" : "Red";

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-width", "2");
    if (isDashed) line.setAttribute("stroke-dasharray", "6,3");
    line.setAttribute("marker-end", "url(#arrow" + markerColor + ")");
    g.appendChild(line);

    var mx = (x1+x2)/2;
    var my = (y1+y2)/2 - 8;
    var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", mx);
    label.setAttribute("y", my);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", strokeColor);
    label.textContent = e.type === "screenshot" ? "截图" : e.type === "record" ? "仅记录" : "混合";
    g.appendChild(label);
  }

  // 画节点
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var c = colors[n.type] || colors.record;
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", n.x);
    rect.setAttribute("y", n.y);
    rect.setAttribute("width", n.w);
    rect.setAttribute("height", n.h);
    rect.setAttribute("rx", "8");
    rect.setAttribute("fill", c.bg);
    rect.setAttribute("stroke", c.border);
    rect.setAttribute("stroke-width", (n.type === "root" || n.type === "done") ? "3" : "2");
    rect.setAttribute("filter", "url(#shadow)");
    g.appendChild(rect);

    var lines = n.label.split("");
    for (var j = 0; j < lines.length; j++) {
      var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", n.x + n.w/2);
      t.setAttribute("y", n.y + n.h/2 + (lines.length > 1 ? (j-0.3)*14 : 5));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", (n.type === "root" || n.type === "done") ? "14" : "12");
      t.setAttribute("font-weight", "600");
      t.setAttribute("fill", c.text);
      t.textContent = lines[j];
      g.appendChild(t);
    }
  }
}

// 初始化
updateStats();
recordNodeInternal("session_start", "会话开始：用户进入产品列表页", false);
