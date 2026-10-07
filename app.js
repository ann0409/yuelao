'use strict';
/* 月老事務所：純 JavaScript，無套件依賴。
 * 沿用原 Apps Script 部署；no-cors 無法證明試算表已寫入。
 * 要確認實際收單，需搭配可驗證回應的後端；本版只顯示「請求已送出」。
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIc0ZFMiPQPIz1ZAqLAWFkFtGSP7Iv6th32zG9Y9X3tlK356HcKw0BdiELL8qZqh-kPA/exec';
const STORE = { cart:'yuelao.cart.v2', wishes:'yuelao.wishes.v2', daily:'yuelao.daily.v2', receipt:'yuelao.receipt.v2', sent:'yuelao.sent.v2' };
const products = [
 {id:1,name:'單抽盲盒 · 緣分款',short:'一盒緣分',price:360,category:'box',art:'single',glyph:'緣',desc:'隨機一款，留一點期待給自己。',detail:'月老盲盒系列，隨機出貨 1 款。六款主題：月老、紅繩、抽籤、緣粉符、良緣簿、同心鎖。單抽無法指定款式。'},
 {id:2,name:'雙入對盒 · 甜蜜款',short:'成雙心意',price:680,category:'box',art:'duo',glyph:'雙',desc:'兩款不重複，一人一份剛剛好。',detail:'內含 2 款不重複的盲盒。適合分送給朋友或喜歡的人；款式隨機搭配，無法指定。'},
 {id:3,name:'全套端盒 · 圓滿 6 入',short:'六款相伴',price:2100,category:'box',art:'set',glyph:'圓',desc:'完整六款，一次收齊這份心意。',detail:'內含全系列 6 款，六款不重複。適合想一次收齊的你，也可以拆成六份心意送人。'},
 {id:4,name:'展示神龕 · 檜木底座',short:'安放喜歡',price:450,category:'accessory',art:'base',glyph:'安',desc:'為喜歡的小物，留一個位置。',detail:'月老盲盒系列展示配件，為公仔提供日常擺放的位置。此商品為底座，不含盲盒公仔；尺寸與實品細節請向店家確認。'}
];
const fortunes = [
 {title:'從一句「最近好嗎」開始。',text:'有些距離，不需要很大的勇氣。用一句自然的問候，替今天留一個開頭。',color:'暖米色',hex:'#c9b38a',action:'傳一句真心的問候',word:'問候'},
 {title:'慢一點，也能剛剛好。',text:'不用急著替一段關係取名字。把注意力留給相處時的舒服，比猜測答案更有用。',color:'霧藍色',hex:'#728b9c',action:'聊天時，先好好聽完',word:'傾聽'},
 {title:'先把自己，照顧得很好。',text:'喜歡不只留給別人。好好吃一餐、讓自己休息，今天也值得被溫柔對待。',color:'茶綠色',hex:'#77836b',action:'留半小時給喜歡的事',word:'安放'},
 {title:'喜歡，可以說得簡單一點。',text:'一個具體的稱讚，比反覆斟酌的長篇訊息更自在。讓心意停在真誠的地方。',color:'磚紅色',hex:'#a65349',action:'說出一個真心的稱讚',word:'真誠'},
 {title:'替日常，換一條小路。',text:'去平常沒坐過的位置，看看不一樣的風景。不一定有故事，但你會多認識一點世界。',color:'蜂蜜色',hex:'#b28745',action:'試一個小小的新選擇',word:'新鮮'},
 {title:'不用猜，溫柔地問。',text:'如果有件事一直放在心裡，找個合適的時間說清楚。理解，常常從一個問題開始。',color:'藕粉色',hex:'#b78c93',action:'用「我想了解」開頭',word:'理解'},
 {title:'把謝謝，說得具體一點。',text:'有人記得你的喜好，有人剛好伸出援手。讓對方知道，這些小事你都有放在心上。',color:'陶土色',hex:'#b87e62',action:'謝謝一位照顧過你的人',word:'感謝'},
 {title:'舒服的距離，也是一種心意。',text:'不用為了靠近而勉強自己，也留一點空間給對方。讓彼此都能自在地說話。',color:'石灰色',hex:'#92938b',action:'說清楚一個自己的需要',word:'自在'},
 {title:'先見面，再慢慢聊。',text:'如果彼此都有意願，不妨約一個輕鬆的行程。散步或一杯飲料，都可以是好開場。',color:'可可色',hex:'#826453',action:'提出一個沒有壓力的邀約',word:'相聚'},
 {title:'留意，那些小小的默契。',text:'也許是相同的笑點，也許是聊不完的興趣。好好享受當下，不用急著把它變成什麼。',color:'酒紅色',hex:'#8d3037',action:'分享一首最近喜歡的歌',word:'分享'},
 {title:'不用完美，也能靠近。',text:'聊天偶爾卡住，說話偶爾害羞，都很正常。比起每句都漂亮，真實更容易讓人理解。',color:'奶茶色',hex:'#c0a083',action:'分享一件今天的小事',word:'自然'},
 {title:'把期待，放得輕一點。',text:'今天先做你能做的事，剩下的留給時間。沒有立即的回應，也不代表你不值得被喜歡。',color:'墨綠色',hex:'#53645b',action:'暫時放下手機去走走',word:'從容'}
];
const figures = [
 {name:'月老',glyph:'緣',quote:'把相遇，輕輕牽在一起。'},
 {name:'紅繩',glyph:'繫',quote:'惦記著，就是一份心意。'},
 {name:'抽籤',glyph:'籤',quote:'給今天，留一個新的提案。'},
 {name:'緣粉符',glyph:'符',quote:'小小祝福，隨身帶著。'},
 {name:'良緣簿',glyph:'簿',quote:'把值得記住的日常寫下來。'},
 {name:'同心鎖',glyph:'合',quote:'一起珍惜，一起慢慢走。'}
];
const $ = id => document.getElementById(id);
const money = amount => 'NT$ ' + amount.toLocaleString('zh-TW');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function readStore(key, fallback, session=false) { try { return JSON.parse((session?sessionStorage:localStorage).getItem(key)) ?? fallback; } catch { return fallback; } }
function writeStore(key, value, session=false) { try { (session?sessionStorage:localStorage).setItem(key,JSON.stringify(value));return true; } catch { return false; } }
function normalizeCart(value) {
 if (!Array.isArray(value)) return [];
 const seen = new Set();
 return value.filter(item => item && products.some(p=>p.id===item.id) && Number.isInteger(item.quantity) && item.quantity>0 && !seen.has(item.id) && seen.add(item.id)).map(item=>({id:item.id,quantity:Math.min(item.quantity,99)}));
}
let cart = normalizeCart(readStore(STORE.cart,[]));
let wishes = readStore(STORE.wishes,[]);
if (!Array.isArray(wishes)) wishes=[];
wishes=wishes.filter(item=>item && typeof item.text==='string' && typeof item.id==='string').slice(0,12).map(item=>({id:item.id,text:item.text.slice(0,80)}));
let category='all', orderSubmitting=false, selectedDetail=1;
let receipt = readStore(STORE.receipt,null,true);
if (!receipt || typeof receipt.text!=='string') receipt=null;
let sentOrders = readStore(STORE.sent,[],true);
if (!Array.isArray(sentOrders)) sentOrders=[];
sentOrders=sentOrders.filter(value=>typeof value==='string').slice(-30);
let toastTimer, dailyRecord=readStore(STORE.daily,null), currentDay='';
const memorySent = new Set(sentOrders);

function showToast(message) {
 const openDialogs=[...document.querySelectorAll('dialog[open]')];
 const current=openDialogs.at(-1);
 const target=current?.querySelector('.dialog-toast');
 if(target) { target.textContent=message;setTimeout(()=>{if(target.textContent===message)target.textContent='';},4500);return; }
 clearTimeout(toastTimer);$('toast-region').innerHTML='<div class="toast">'+esc(message)+'</div>';
 toastTimer=setTimeout(()=>{$('toast-region').replaceChildren();},4500);
}
function openDialog(id) {
 const el=$(id);if(el.open)return;
 el.showModal();document.body.style.overflow='hidden';
}
function closeDialog(el) {
 if(el.id==='checkout-modal' && orderSubmitting)return;
 el.close();
}
function syncBodyScroll() {document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';}
function packHTML(pink=false) {return `<div class="pack${pink?' pink':''}"><span class="pack-en">ATELIER DU DESTIN</span><strong>月老<br>事務所</strong><span class="pack-circle">緣</span><small>一盒，一個剛好的相遇。</small></div>`;}
function productArt(type) {
 if(type==='base')return '<div class="product-art"><div class="base-art">緣</div></div>';
 return `<div class="product-art ${type}">${packHTML(type==='single')}${['duo','set'].includes(type)?packHTML(true):''}${type==='set'?packHTML():''}</div>`;
}
function renderProducts() {
 const keyword=$('product-search').value.trim().toLowerCase();
 let results=products.filter(p=>(category==='all'||p.category===category) && (p.name+p.desc).toLowerCase().includes(keyword));
 if($('product-sort').value==='price-asc')results.sort((a,b)=>a.price-b.price);
 if($('product-sort').value==='price-desc')results.sort((a,b)=>b.price-a.price);
 $('product-grid').innerHTML=results.map(p=>`<article class="product-card"><button class="product-image" data-detail="${p.id}" aria-label="查看${p.name}商品介紹"><span class="index">NO. 0${p.id}</span>${productArt(p.art)}<span class="image-label">${p.art==='base'?'外觀示意':'包裝示意'}</span></button><h3><button data-detail="${p.id}" style="padding:0;text-align:left">${p.name}</button></h3><p>${p.desc}</p><div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="將${p.name}加入結緣袋">加入結緣袋 ＋</button></div></article>`).join('');
 $('product-empty').hidden=results.length!==0;
}
function openProduct(id) {
 const p=products.find(item=>item.id===id);if(!p)return;selectedDetail=id;
 $('detail-title').textContent=p.name;$('detail-image').innerHTML=productArt(p.art);
 $('detail-copy').innerHTML=`<p>${p.detail}</p><strong>${money(p.price)}</strong><p class="checkout-info">${p.art==='base'?'外觀':'包裝'}為設計示意，非商品實拍。提供超商取貨付款及正修科技大學面交。</p>`;
 openDialog('detail-dialog');
}
function cartItems() {return cart.map(item=>({...products.find(p=>p.id===item.id),quantity:item.quantity}));}
function cartSubtotal(){return cartItems().reduce((sum,item)=>sum+item.price*item.quantity,0);}
function cartKey(){return cart.map(item=>`${item.id}:${item.quantity}`).sort().join('|');}
function saveCart() {writeStore(STORE.cart,cart);}
function addToCart(id) {
 if(orderSubmitting)return;
 const product=products.find(p=>p.id===id);if(!product)return;
 const item=cart.find(item=>item.id===id);
 if(item && item.quantity>=99)return showToast('單款最多可選 99 件。');
 if(item)item.quantity++;else cart.push({id,quantity:1});
 saveCart();renderCart();showToast(`已加入「${product.short}」`);
}
function updateQty(id,change) {
 if(orderSubmitting)return;
 const item=cart.find(item=>item.id===id);if(!item)return;
 if(item.quantity+change>99)return showToast('單款最多可選 99 件。');
 item.quantity+=change;cart=cart.filter(item=>item.quantity>0);saveCart();renderCart();
}
function renderCart() {
 const count=cart.reduce((sum,item)=>sum+item.quantity,0);
 $('cart-count-badge').textContent=count;$('cart-heading-count').textContent=count?'('+count+')':'';
 $('cart-total').textContent=money(cartSubtotal());$('checkout-button').disabled=!count;
 $('cart-items').innerHTML=count?cartItems().map(item=>`<article class="cart-item"><div class="cart-thumb" aria-hidden="true">${item.glyph}</div><div><h3>${item.name}</h3><p>${money(item.price)} / 件</p><div class="quantity-row"><div class="stepper"><button data-qty="${item.id}" data-change="-1" aria-label="減少${item.name}數量">−</button><span aria-label="數量">${item.quantity}</span><button data-qty="${item.id}" data-change="1" aria-label="增加${item.name}數量">＋</button></div><button class="remove-button" data-remove="${item.id}" aria-label="移除${item.name}">移除</button></div></div></article>`).join(''):'<div class="empty-state"><p class="serif" style="font-size:23px;margin-bottom:15px">心意，還有空位。</p><p>先挑一份喜歡的，再回來看看。</p><button class="text-button" data-action="browse" style="margin-top:20px">去逛逛選品 ↗</button></div>';
}
function getCheckoutTotals() {
 const method=document.querySelector('input[name="payment-method"]:checked').value;
 const subtotal=cartSubtotal(),shipping=cart.length && method==='cvs'?60:0;
 return {method,subtotal,shipping,total:subtotal+shipping};
}
function updateCheckoutMethod() {
 const t=getCheckoutTotals(),meetup=t.method==='meetup';
 $('checkout-store-fields').hidden=meetup;$('checkout-store-fields').disabled=meetup;
 $('checkout-store-name').required=!meetup;$('meetup-info').hidden=!meetup;
 ['subtotal','shipping','total'].forEach(key=>$('checkout-'+key+'-display').textContent=money(t[key]));
 $('checkout-items').innerHTML=cartItems().map(item=>`<div class="summary-line"><span>${item.name} × ${item.quantity}</span><span>${money(item.price*item.quantity)}</span></div>`).join('');
 $('checkout-payment-note').textContent=meetup?'正修科技大學面交時付現。時間與校內確切地點另行確認。':'超商到店付款；取件姓名需與身分證件相符。';
}
function checkout() {
 if(!cart.length)return showToast('結緣袋還是空的，先挑選商品吧。');
 closeDialog($('cart-dialog'));updateCheckoutMethod();
 $('order-status').textContent='';$('submit-order-button').disabled=false;$('submit-order-button').textContent='確認送出訂單 ↗';
 openDialog('checkout-modal');
}
function showCheckoutError(message,id) {
 $('order-status').textContent=message;
 if(id){$(id).setAttribute('aria-invalid','true');$(id).focus();}
}
function setOrderBusy(busy) {
 orderSubmitting=busy;
 $('checkout-form').querySelectorAll('input,select,button').forEach(el=>el.disabled=busy);
 if(!busy)updateCheckoutMethod();
}
function orderSummary(includeContact=false) {
 const t=getCheckoutTotals();
 const lines=['月老事務所｜結緣明細',''];
 cartItems().forEach(item=>lines.push(`${item.name} × ${item.quantity}　${money(item.price*item.quantity)}`));
 lines.push('',`商品小計：${money(t.subtotal)}`,`運費：${money(t.shipping)}`,`應付總額：${money(t.total)}`,`取貨付款：${t.method==='meetup'?'正修科技大學面交／現金付款':'超商取貨付款'}`);
 if(t.method==='meetup')lines.push('面交時間與校內確切地點另行約定。');
 else if($('checkout-store-name').value.trim())lines.push(`門市：${$('checkout-store-brand').value} ${$('checkout-store-name').value.trim()}`);
 if(includeContact){lines.push(`姓名：${$('checkout-name').value.trim()}`,`手機：${$('checkout-phone').value.trim()}`);}
 return lines.join('\n');
}
async function sendDataToGoogleSheet(action,data) {
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(SCRIPT_URL))throw new Error('尚未設定有效的訂單接收網址');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try {
  const body=new URLSearchParams({action,...data});
  await fetch(SCRIPT_URL,{method:'POST',body,mode:'no-cors',credentials:'omit',signal:controller.signal});
  // Opaque 回應只能表示請求傳送完成，不能證明試算表已新增資料。
 } finally {clearTimeout(timeout);}
}
async function submitOrder(event) {
 event?.preventDefault();if(orderSubmitting)return;
 if(!cart.length)return showCheckoutError('結緣袋是空的，訂單尚未送出。');
 $('checkout-form').querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
 const name=$('checkout-name').value.trim(),phone=$('checkout-phone').value.replace(/[\s-]/g,'');
 const storeName=$('checkout-store-name').value.trim(),t=getCheckoutTotals();
 if(!name)return showCheckoutError('訂單尚未送出：請填寫聯絡人姓名。','checkout-name');
 if(!/^09\d{8}$/.test(phone))return showCheckoutError('訂單尚未送出：手機須為 09 開頭、共 10 碼。','checkout-phone');
 if(t.method==='cvs'&&!storeName)return showCheckoutError('訂單尚未送出：請填寫門市名稱或店號。','checkout-store-name');
 // 同一分頁中的相同商品、姓名、電話與取貨方式，避免重複送出。
 const fingerprint=await hashText(JSON.stringify([cartKey(),name,phone,t.method,t.method==='cvs'?[$('checkout-store-brand').value,storeName]:null]));
 if(orderSubmitting)return;
 if(memorySent.has(fingerprint))return showCheckoutError('這份訂單已送出過，請先等候店家確認。可從頁面上方查看明細。');
 const orderId='YL-'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
 const data={orderId,name,phone,store:t.method==='meetup'?'正修科技大學面交（現場現金付款；時間與校內地點另約）':$('checkout-store-brand').value+' '+storeName,paymentMethod:t.method==='meetup'?'正修科技大學面交（現金付款）':'超商取貨付款',subtotal:t.subtotal,shipping:t.shipping,total:t.total,items:cartItems().map(item=>`${item.name} x${item.quantity}`).join(', ')};
 const summary=orderSummary(false);
 setOrderBusy(true);$('submit-order-button').textContent='訂單傳送中…';$('order-status').textContent='正在傳送，請稍候。';
 let sent=false;
 try {
  await sendDataToGoogleSheet('order',data);
  memorySent.add(fingerprint);writeStore(STORE.sent,[...memorySent].slice(-30),true);
  const timestamp=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',dateStyle:'medium',timeStyle:'short'}).format(new Date());
  receipt={text:`${summary}\n\n送出時間：${timestamp}\n請求識別碼：${orderId}\n狀態：請求已送出，待店家確認。`,cartKey:cartKey()};
  // 不保存姓名、手機；保留購物車，避免未收到訂單時失去明細。
  writeStore(STORE.receipt,receipt,true);updateReceipt();sent=true;
 } catch(error) {
  showCheckoutError('暫時無法確認送出結果，資料已保留。請先向店家確認是否收到，再決定是否重試。');
 } finally {
  setOrderBusy(false);$('submit-order-button').textContent='確認送出訂單 ↗';
  if(sent){closeDialog($('checkout-modal'));showToast('訂單請求已送出，待店家確認。明細已保留在頁面上方。');}
 }
}
async function hashText(text) {
 if(globalThis.crypto?.subtle){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
 // 無 Web Crypto 時只在記憶體防重複，不把姓名、手機存入瀏覽器。
 let hash=2166136261;for(const char of text){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return 'fallback-'+(hash>>>0).toString(16);
}
function updateReceipt() { $('receipt-banner').hidden=!receipt;if(receipt)$('receipt-text').textContent=receipt.text; }
async function copyText(text) {
 try {if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(text);showToast('已複製，可以貼到訊息或記事本。');}
 catch {$('copy-text').value=text;openDialog('copy-dialog');$('copy-text').focus();$('copy-text').select();}
}
function taipeiDate(now=new Date()) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
}
function refreshDaily() {
 const day=taipeiDate();if(day===currentDay)return;currentDay=day;
 $('daily-date').textContent=day.replaceAll('-',' / ')+' · 今日一籤';
 if(!dailyRecord||dailyRecord.date!==day||!Number.isInteger(dailyRecord.index)||!fortunes[dailyRecord.index])dailyRecord=null;
 renderDaily();
}
function renderDaily() {
 if(!dailyRecord){$('daily-content').innerHTML='<span class="kicker muted">你的今日小籤，還未拆封</span><h3>給今天，一點好心情。</h3><p>把步調放慢，想著此刻的自己。<br>一張小籤，一個可以試試的日常行動。</p><button class="button" data-action="draw-daily">拆開今日小籤 <span aria-hidden="true">↗</span></button>';return;}
 const f=fortunes[dailyRecord.index];
 $('daily-content').innerHTML=`<span class="kicker muted">第 ${String(dailyRecord.index+1).padStart(2,'0')} 籤 · ${f.word}</span><h3>${f.title}</h3><p>${f.text}</p><div class="daily-details"><div><strong>今日色彩</strong><span class="fortune-color" style="background:${f.hex}"></span>${f.color}</div><div><strong>試試這個小行動</strong>${f.action}</div></div><div class="daily-bottom"><small>今天就收下這一張，明天再來。<br>以台北時間換日更新。</small><button class="text-button" data-action="copy-daily">複製小籤 ↗</button></div>`;
}
function drawDaily() {
 refreshDaily();if(dailyRecord)return;
 // 依日期固定籤序，即使儲存受限或重新整理，同一天也保持相同。
 const days=Math.floor(Date.parse(currentDay+'T00:00:00Z')/86400000);
 dailyRecord={date:currentDay,index:((days*7+3)%fortunes.length+fortunes.length)%fortunes.length};
 writeStore(STORE.daily,dailyRecord);renderDaily();$('daily-content').classList.remove('draw-anim');requestAnimationFrame(()=>$('daily-content').classList.add('draw-anim'));
}
function renderWishes() {
 if(!wishes.length){$('wish-wall').innerHTML='<article class="wish-tag"><p>願日常裡的小小心意，<br>都有人好好接住。</p><small>示範心願 · 換你寫一張</small></article><article class="wish-tag"><p>也願今天的自己，<br>比昨天更自在一點。</p><small>示範心願 · 給自己也很好</small></article>';return;}
 $('wish-wall').innerHTML=wishes.map(w=>`<article class="wish-tag"><button type="button" data-delete-wish="${esc(w.id)}" aria-label="刪除這張心願">×</button><p>${esc(w.text)}</p><small>我的心願 · 僅此瀏覽器</small></article>`).join('');
}
function postWish(event) {
 event.preventDefault();const text=$('wish-input').value.trim();if(!text)return showToast('先寫下一句心願吧。');
 if(wishes.length>=12)return showToast('最多保留 12 張心願，先移除一張，再掛上新的吧。');
 wishes.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:text.slice(0,80)});
 const saved=writeStore(STORE.wishes,wishes);renderWishes();$('wish-input').value='';$('wish-count').textContent='0';showToast(saved?'心願已掛好，留在這裡陪你。':'心願已掛好；目前瀏覽器無法儲存，關閉後不會保留。');
}
let isOrbiting=!matchMedia('(prefers-reduced-motion: reduce)').matches,boxOpened=false,tearProgress=0,dragStart=null,tearStart=0,openingTimer=null;
function renderOrbit() {$('destiny-box').classList.toggle('box-orbiting',isOrbiting);$('orbit-button').textContent=isOrbiting?'暫停旋轉':'旋轉看看';$('orbit-button').setAttribute('aria-pressed',String(isOrbiting));}
function toggleOrbit(){if(boxOpened)return;isOrbiting=!isOrbiting;renderOrbit();}
function updateTear(progress){tearProgress=Math.max(0,Math.min(progress,100));$('tear-peeled').style.width=tearProgress+'%';$('tear-handle').style.left=`calc(${tearProgress}% - ${23*tearProgress/100}px)`;}
function revealFigure(){
 if(boxOpened)return;boxOpened=true;isOrbiting=false;renderOrbit();$('orbit-button').disabled=true;
 const f=figures[Math.floor(Math.random()*figures.length)];$('figure-glyph').textContent=f.glyph;$('figure-name').textContent=f.name;$('figure-quote').textContent=f.quote;
 $('destiny-box').classList.add('box-opened');$('figure-reveal').setAttribute('aria-hidden','false');$('tear-track').tabIndex=-1;
 $('open-box-button').textContent='這一盒，遇見了'+f.name;$('open-box-button').disabled=true;$('box-status').textContent='你拆到了「'+f.name+'」・線上體驗';
}
function autoTearOpen(){
 if(boxOpened||openingTimer)return;isOrbiting=false;renderOrbit();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){updateTear(100);revealFigure();return;}
 openingTimer=setInterval(()=>{updateTear(tearProgress+5);if(tearProgress>=100){clearInterval(openingTimer);openingTimer=null;revealFigure();}},25);
}
function resetBoxStage(){
 clearInterval(openingTimer);openingTimer=null;boxOpened=false;dragStart=null;updateTear(0);
 $('destiny-box').classList.remove('box-opened');$('figure-reveal').setAttribute('aria-hidden','true');$('tear-track').tabIndex=0;
 $('open-box-button').disabled=false;$('open-box-button').innerHTML='幫我拆一盒 <span aria-hidden="true">↗</span>';$('orbit-button').disabled=false;
 $('box-status').textContent='向右拖曳拉條，或點「幫我拆一盒」';isOrbiting=!matchMedia('(prefers-reduced-motion: reduce)').matches;renderOrbit();
}
function toggleMenu(){const hidden=$('mobile-menu').hidden;$('mobile-menu').hidden=!hidden;$('menu-button').setAttribute('aria-expanded',String(hidden));}
const actions={
 'open-cart':()=>{renderCart();openDialog('cart-dialog');},
 menu:toggleMenu,checkout,
 browse:()=>{closeDialog($('cart-dialog'));$('shop').scrollIntoView();},
 'copy-cart':()=>{if(!cart.length)return showToast('結緣袋還是空的。');copyText(['月老事務所｜商品明細',...cartItems().map(i=>`${i.name} × ${i.quantity}　${money(i.price*i.quantity)}`),`商品小計：${money(cartSubtotal())}`,'運費：超商 NT$ 60／正修科技大學面交免運'].join('\n'));},
 'copy-checkout':()=>copyText(orderSummary(true)),
 receipt:()=>{if(receipt){updateReceipt();openDialog('receipt-dialog');}},
 'copy-receipt':()=>{if(receipt)copyText(receipt.text);},
 'draw-daily':drawDaily,
 'copy-daily':()=>{refreshDaily();if(dailyRecord){const f=fortunes[dailyRecord.index];copyText(`月老事務所｜今日良緣 ${currentDay}\n${f.title}\n${f.text}\n今日色彩：${f.color}\n小行動：${f.action}`);}},
 'open-box':autoTearOpen,'reset-box':resetBoxStage,orbit:toggleOrbit,
 divination:()=>{$('divination-iframe').src||($('divination-iframe').src='https://yuelaoqiuqian.vercel.app');openDialog('divination-modal');}
};
document.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el)return;
 if(el.hasAttribute('data-close')){event.preventDefault();return closeDialog(el.closest('dialog'));}
 if(el.dataset.action){event.preventDefault();return actions[el.dataset.action]?.();}
 if(el.dataset.add)return addToCart(Number(el.dataset.add));
 if(el.dataset.detail)return openProduct(Number(el.dataset.detail));
 if(el.dataset.category){category=el.dataset.category;document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));renderProducts();return;}
 if(el.dataset.qty)return updateQty(Number(el.dataset.qty),Number(el.dataset.change));
 if(el.dataset.remove){cart=cart.filter(item=>item.id!==Number(el.dataset.remove));saveCart();renderCart();return;}
 if(el.dataset.deleteWish){wishes=wishes.filter(item=>item.id!==el.dataset.deleteWish);writeStore(STORE.wishes,wishes);renderWishes();}
});
$('product-search').addEventListener('input',renderProducts);$('product-sort').addEventListener('change',renderProducts);
$('detail-add').addEventListener('click',()=>addToCart(selectedDetail));
$('checkout-form').addEventListener('submit',submitOrder);
document.querySelectorAll('[name="payment-method"]').forEach(el=>el.addEventListener('change',()=>{updateCheckoutMethod();$('order-status').textContent='';}));
$('checkout-form').addEventListener('input',event=>{event.target.removeAttribute('aria-invalid');});
$('wish-form').addEventListener('submit',postWish);$('wish-input').addEventListener('input',()=>$('wish-count').textContent=$('wish-input').value.length);
$('mobile-menu').addEventListener('click',event=>{if(event.target.closest('a')){$('mobile-menu').hidden=true;$('menu-button').setAttribute('aria-expanded','false');}});
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.addEventListener('close',syncBodyScroll);
 dialog.addEventListener('cancel',event=>{if(dialog.id==='checkout-modal'&&orderSubmitting)event.preventDefault();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});
});
const track=$('tear-track');
track.addEventListener('pointerdown',event=>{if(boxOpened||openingTimer)return;isOrbiting=false;renderOrbit();dragStart=event.clientX;tearStart=tearProgress;track.setPointerCapture(event.pointerId);});
track.addEventListener('pointermove',event=>{if(dragStart===null||boxOpened)return;updateTear(tearStart+(event.clientX-dragStart)/track.clientWidth*100);if(tearProgress>=98){dragStart=null;updateTear(100);revealFigure();}});
track.addEventListener('pointerup',()=>dragStart=null);track.addEventListener('pointercancel',()=>dragStart=null);
track.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();autoTearOpen();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDaily();});
setInterval(refreshDaily,60000);
renderProducts();renderCart();renderWishes();refreshDaily();renderOrbit();updateReceipt();
