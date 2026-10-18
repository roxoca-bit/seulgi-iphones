'use strict';
const story = window.IPHONE_STORY;
const $ = (s) => document.querySelector(s);
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appLabels={kakao:'카카오톡',messages:'메시지',photos:'사진',notes:'메모',phone:'전화',calendar:'캘린더',settings:'설정',about:'정보'};
const apps=[
  {id:'kakao', label:'카카오톡', emoji:'💬', bg:'#fee500'},
  {id:'photos', label:'사진', emoji:'🌼', bg:'#f7f8fd'},
  {id:'notes', label:'메모', emoji:'📝', bg:'#ffed96'},
  {id:'calendar', label:'캘린더', emoji:'📅', bg:'#fff'},
  {id:'messages', label:'메시지', emoji:'💭', bg:'#61d879'},
  {id:'phone', label:'전화', emoji:'📞', bg:'#65ce71'},
  {id:'settings', label:'설정', emoji:'⚙️', bg:'#c9cdd7'},
  {id:'about', label:'정보', emoji:'✨', bg:'#e9ddfa'}
];
let nav=[],unlocked=false,view='home';
function iconMarkup(app){return `<button class="app-button" data-app="${app.id}" type="button"><span class="app-icon" style="background:${app.bg}">${app.emoji}</span><span>${app.label}</span></button>`}
$('#appGrid').innerHTML=apps.map(iconMarkup).join('');
$('#dock').innerHTML=['phone','messages','kakao','photos'].map(id=>iconMarkup(apps.find(a=>a.id===id))).join('');
document.querySelectorAll('[data-app]').forEach(el=>el.addEventListener('click',()=>open(el.dataset.app)));
$('#phone').classList.add(['lavender','peach','ocean','midnight'].includes(story.wallpaper)?story.wallpaper:'lavender');
function timeString(){return new Date().toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit',hour12:false})}
function updateClock(){const now=new Date();$('#statusTime').textContent=timeString();$('#lockClock').textContent=timeString();$('#lockDate').textContent=story.lockDateLabel || now.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'});$('#widgetDay').textContent=now.getDate()}
updateClock();setInterval(updateClock,30000);
$('#lockNotifications').innerHTML=(story.notifications||[]).map(n=>`<button type="button" class="notification" data-notification="${n.app==='카카오톡'?'kakao':n.app==='메모'?'notes':'messages'}"><span class="nicon">${esc(n.icon)}</span><span style="flex:1"><strong>${esc(n.app)} · ${esc(n.title)}</strong><small>${esc(n.time)}</small><p>${esc(n.message)}</p></span></button>`).join('');
function unlock(){if(story.pin && prompt('암호를 입력하세요')!==story.pin)return;unlocked=true;$('#lockView').classList.add('hidden');showHome()}
$('#unlock').addEventListener('click',unlock);$('#lockView').addEventListener('click',e=>{if(!e.target.closest('.notification'))unlock()});
document.querySelectorAll('[data-notification]').forEach(b=>b.addEventListener('click',()=>{if(story.pin && prompt('암호를 입력하세요')!==story.pin)return;unlocked=true;$('#lockView').classList.add('hidden');open(b.dataset.notification)}));
let swipeY=0;$('#lockView').addEventListener('touchstart',e=>{swipeY=e.touches[0].clientY},{passive:true});$('#lockView').addEventListener('touchend',e=>{if(swipeY-e.changedTouches[0].clientY>40)unlock()},{passive:true});
function showHome(){view='home';nav=[];$('#appView').classList.add('hidden');$('#homeView').classList.remove('hidden');history.replaceState(null,'',location.pathname+location.search)}
$('#homeIndicator').addEventListener('click',()=>{if(!unlocked){unlock();return}showHome()});
$('#backBtn').addEventListener('click',()=>{const previous=nav.pop();previous?render(previous):showHome()});
function open(id){if(!unlocked){unlock();if(!unlocked)return}if(view!=='home')nav.push(view);render(id)}
function render(id){view=id;$('#homeView').classList.add('hidden');$('#appView').classList.remove('hidden');$('#appBody').className='app-body';$('#appFooter').innerHTML='';$('#appHeaderRight').textContent='';let [kind,arg]=id.split(':');$('#appTitle').textContent=appLabels[kind]||'상세 보기';$('#appBody').innerHTML='';history.replaceState(null,'','#'+encodeURIComponent(id));
if(id==='kakao')return rooms(story.contacts,'chat','카카오톡');
if(id==='messages')return rooms(story.texts,'sms','메시지');
if(kind==='chat')return conversation(story.contacts.find(c=>c.id===arg),false);
if(kind==='sms')return conversation(story.texts[Number(arg)],true);
if(id==='notes')return notes();
if(kind==='note')return note(story.notes.find(n=>n.id===arg));
if(id==='photos')return photos();
if(kind==='photo')return photo(story.photos.find(p=>p.id===arg));
if(id==='phone')return calls();
if(id==='calendar')return calendar();
if(id==='settings')return settings();
if(id==='about')return about();
$('#appBody').innerHTML='<p class="empty">화면을 찾을 수 없습니다.</p>';
}
function rooms(items,kind,label){$('#appTitle').textContent=label;$('#appBody').innerHTML=`<h2 class="screen-title">${esc(label==='카카오톡'?'채팅':'메시지')}</h2>`+(items||[]).map((c,i)=>`<button class="list-item" data-target="${kind}:${kind==='chat'?encodeURIComponent(c.id):i}"><span class="avatar" style="background:${/^#[0-9a-fA-F]{3,8}$/.test(c.color||'')?c.color:'#e1e8ee'}">${esc(c.avatar||'👤')}</span><span class="list-main"><strong>${esc(c.name)}</strong><div class="preview">${esc(c.preview||c.messages?.at(-1)?.text||'')}</div></span><span class="list-time">${esc(c.time||'')}</span></button>`).join('');bindTargets()}
function conversation(c,isSms){if(!c){$('#appBody').innerHTML='<p class="empty">대화가 없습니다.</p>';return}$('#appTitle').textContent=c.name;$('#appBody').classList.toggle('text-bubbles',isSms);$('#appBody').innerHTML=`<div class="chat-bg">${(c.messages||[]).map(m=>`<div class="chat-line ${m.from==='me'?'me':''}">${m.from==='me'?'':`<span class="chat-avatar">${esc(c.avatar||'👤')}</span>`}<span class="bubble">${esc(m.text)}</span><span class="chat-time">${esc(m.time)}</span></div>`).join('')}</div>`;$('#appFooter').innerHTML='<div class="chat-readonly">🔒 보관된 대화 · 읽기 전용</div>'}
function notes(){$('#appBody').innerHTML=`<h2 class="screen-title">모든 메모 <span style="font-weight:400;font-size:15px;color:#999">${story.notes.length}</span></h2><div class="notes-list">${story.notes.map(n=>`<button data-target="note:${encodeURIComponent(n.id)}"><strong>${esc(n.title)}</strong><p>${esc(n.updated)} · ${esc(n.body.slice(0,28))}</p></button>`).join('')}</div>`;bindTargets()}
function note(n){if(!n)return;$('#appTitle').textContent=n.title;$('#appBody').innerHTML=`<div class="note-paper">${esc(n.body)}</div>`;$('#appHeaderRight').textContent=n.updated}
function photoTile(p,large=false){const safeSrc=typeof p.src==='string'&&/^(images\/|\.\/images\/)[\w./%-]+$/i.test(p.src)?p.src:null;const safeGradient=typeof p.color==='string'&&/^linear-gradient\([#\w\d\s,.()%+-]+\)$/.test(p.color)?p.color:'linear-gradient(140deg,#aaa,#ddd)';return `<span class="${large?'photo-large':'photo-thumb'}" style="background:${safeGradient}">${safeSrc?`<img src="${esc(safeSrc)}" alt="${esc(p.title)}" loading="lazy">`:esc(p.emoji||'📷')}</span>`}
function photos(){$('#appBody').innerHTML=`<h2 class="screen-title">최근 항목</h2><div class="photo-grid">${story.photos.map(p=>`<button style="padding:0;border:0;background:none" data-target="photo:${encodeURIComponent(p.id)}" aria-label="${esc(p.title)}">${photoTile(p)}</button>`).join('')}</div>`;bindTargets()}
function photo(p){if(!p)return;$('#appTitle').textContent='사진';$('#appBody').innerHTML=photoTile(p,true)+`<div class="photo-meta"><h2>${esc(p.title)}</h2><p>${esc(p.date)}</p></div>`}
function calls(){$('#appBody').innerHTML=`<h2 class="screen-title">최근 통화</h2>${story.calls.map(c=>`<div class="list-item"><span class="avatar" style="background:#edf1fd">📞</span><span class="list-main"><strong class="${c.missed?'call-missed':''}">${esc(c.name)}</strong><div class="preview">${esc(c.detail)}</div></span><span class="list-time">${esc(c.time)}</span></div>`).join('')}`}
function calendar(){const d=new Date();const first=new Date(d.getFullYear(),d.getMonth(),1).getDay();const days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();let cells=Array.from({length:first},()=>'<span></span>').join('');for(let i=1;i<=days;i++)cells+=`<span style="display:grid;place-items:center;height:38px;${i===d.getDate()?'background:#e95e6d;color:white;border-radius:50%;':''}">${i}</span>`;$('#appBody').innerHTML=`<h2 class="screen-title">${d.getFullYear()}년 ${d.getMonth()+1}월</h2><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:9px;text-align:center;font-size:13px"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>${cells}</div><p class="section-heading">오늘의 일정</p><div class="setting-row">아직 등록된 일정이 없습니다.</div>`}
function settings(){$('#appBody').innerHTML=`<h2 class="screen-title">설정</h2><div class="setting-row">기기 이름 <span>${esc(story.deviceName)}</span></div><div class="setting-row">소유자 <span>${esc(story.owner)}</span></div><div class="setting-row">접근 권한 <span>읽기 전용</span></div><div class="setting-row">테마 <span>${esc(story.wallpaper)}</span></div><p class="section-heading">이 사이트는 실제 아이폰이나 카카오톡에 연결되지 않는 창작용 웹페이지입니다.</p>`}
function about(){$('#appBody').innerHTML=`<h2 class="screen-title">안녕하세요 ✨</h2><div class="note-paper">이 휴대폰은 ${esc(story.owner)}의 이야기입니다.\n\n카카오톡, 메모, 사진첩을 천천히 둘러보세요.\n\n보이지 않던 이야기가 조금씩 나타날 거예요.</div>`}
function bindTargets(){document.querySelectorAll('[data-target]').forEach(el=>el.addEventListener('click',()=>open(decodeURIComponent(el.dataset.target))))}
// 직접 URL의 #kakao, #notes 등을 열면 해당 앱으로 이동
const initial=decodeURIComponent(location.hash.slice(1));if(initial && (appLabels[initial] || /^(chat|sms|note|photo):/.test(initial))){unlocked=true;$('#lockView').classList.add('hidden');render(initial)}
