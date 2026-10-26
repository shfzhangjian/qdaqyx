(() => {
'use strict';
const data=window.CHANGELOG_DATA||{};
const manifest=data['changelog/manifest.json'];
const $=id=>document.getElementById(id);
const status=$('status');
if(!manifest||!data['changelog/recent.json']){status.textContent='索引加载失败，请确认 changelog 目录完整并重新生成索引后刷新。';return;}
const labels={ui:'UI 界面',data:'数据与业务规则',docs:'文档与交接',engineering:'工程与运行'};
const types={feat:'新功能',fix:'缺陷修复',migrate:'页面迁移',docs:'文档',style:'样式',chore:'工程杂项',revert:'回滚'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=data['changelog/recent.json'],generation=0;
const loading=new Map();
function load(file){
 if(data[file])return Promise.resolve(data[file]);
 if(loading.has(file))return loading.get(file);
 const promise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=file.replace(/\.json$/,'.js');
  const timer=setTimeout(()=>{script.remove();loading.delete(file);reject(new Error('加载超时'))},10000);
  script.onload=()=>{clearTimeout(timer);script.remove();loading.delete(file);data[file]?resolve(data[file]):reject(new Error('数据缺失'))};
  script.onerror=()=>{clearTimeout(timer);script.remove();loading.delete(file);reject(new Error('文件加载失败'))};
  document.head.appendChild(script);
 });loading.set(file,promise);return promise;
}
for(const month of [...new Set(manifest.buckets.map(b=>b.month))])$('f-period').add(new Option(month,month));
for(const [type,label] of Object.entries(types))$('f-type').add(new Option(label,type));
for(const scope of [...new Set(manifest.buckets.flatMap(b=>b.scopes))].sort())$('f-scope').add(new Option(scope,scope));
const ym=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,7);
const monthCount=manifest.buckets.filter(b=>b.month===ym).reduce((n,b)=>n+b.count,0);
$('stats').innerHTML=[['历史记录',manifest.total],['本月记录',monthCount],['近期摘要',rows.length],['历史月份',new Set(manifest.buckets.map(b=>b.month)).size]].map(([label,n])=>`<div class="stat-card"><div class="num">${n}</div><div class="label">${label}</div></div>`).join('');
function render(){
 const category=$('f-category').value,type=$('f-type').value,scope=$('f-scope').value,kw=$('f-kw').value.trim().toLowerCase();
 const list=rows.filter(l=>(!category||l.categories.includes(category))&&(!type||l.type===type)&&(!scope||l.scope===scope)&&(!kw||JSON.stringify([l.title,l.tags,l.pages,l.scope,l.id]).toLowerCase().includes(kw)));
 $('count').textContent=`当前范围 ${list.length} / ${rows.length} 条`;
 $('empty').style.display=list.length?'none':'block';
 $('timeline').innerHTML=list.map(l=>`<div class="log-item" data-id="${escape(l.id)}"><div class="log-card"><button class="log-head" aria-expanded="false"><span class="log-date">${escape(l.date)} ${escape(l.time)}</span><span class="tag tag-${escape(l.type)}">${escape(types[l.type])}</span><span class="scope">${escape(l.categories.map(c=>labels[c]).join(' / '))}</span><span class="scope">${escape(l.scope)}</span><span class="log-title">${escape(l.title)}</span><span class="author">${escape(l.author)}</span></button><div class="log-detail"></div></div></div>`).join('');
}
$('timeline').addEventListener('click',async e=>{
 const button=e.target.closest('button.log-head');if(!button)return;
 const item=button.closest('.log-item'),detail=item.querySelector('.log-detail');
 const open=item.classList.toggle('open');button.setAttribute('aria-expanded',String(open));
 if(!open||detail.dataset.loaded)return;
 detail.textContent='正在加载详情…';
 try{const l=await load(rows.find(r=>r.id===item.dataset.id).file);detail.textContent=l.detail;const meta=document.createElement('div');meta.className='pages';meta.textContent=`${l.id} · 影响页面：${l.pages.join('、')} · 标签：${l.tags.join('、')}`;detail.appendChild(meta);detail.dataset.loaded='true';}
 catch(err){detail.textContent=`详情加载失败：${err.message}。收起后再次展开可重试。`;}
});
$('f-period').addEventListener('change',async()=>{
 const current=++generation,period=$('f-period').value;
 rows=[];render();status.textContent='正在加载所选范围摘要…';
 try{
  const next=period==='recent'?data['changelog/recent.json']:(await Promise.all(manifest.buckets.filter(b=>b.month===period).map(b=>load(b.file)))).flat();
  if(current!==generation)return;
  rows=next;render();status.textContent=`${period==='recent'?'最近 50 条':period+' 归档'}：仅搜索标题、标签、页面标识和编号；详情按条加载。`;
 }catch(err){if(current===generation)status.textContent=`索引加载失败：${err.message}。请重新选择范围重试。`;}
});
for(const id of ['f-category','f-type','f-scope'])$(id).addEventListener('change',render);
$('f-kw').addEventListener('input',render);
render();
})();
