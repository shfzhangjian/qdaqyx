import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import vm from 'node:vm';
import { get } from 'node:http';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(join(tmpdir(),'qdaqyx-changelog-'));
const run=(...args)=>execFileSync(process.execPath,[join(temp,'scripts/changelog.mjs'),...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const read=p=>JSON.parse(readFileSync(join(temp,p),'utf8'));
try{
 mkdirSync(join(temp,'scripts'));cpSync(join(root,'scripts/changelog.mjs'),join(temp,'scripts/changelog.mjs'));
 cpSync(join(root,'changelog/records'),join(temp,'changelog/records'),{recursive:true});
 const sample=read('changelog/records/2026-10/20261026-07.json');
 for(let n=1;n<=151;n++){
  const id=`20260901-${String(n).padStart(2,'0')}`;
  mkdirSync(join(temp,'changelog/records/2026-09'),{recursive:true});
  writeFileSync(join(temp,`changelog/records/2026-09/${id}.json`),JSON.stringify({...sample,id,date:'2026-09-01',title:`测试${n}`,categories:['data'],tags:['审批']}));
 }
 run('build');run('check');
 const m=read('changelog/manifest.json'),recent=read('changelog/recent.json');
 assert.equal(m.total,158);assert.equal(recent.length,50);assert.equal(recent[7].id,'20260901-151');
 assert.equal(m.buckets.filter(b=>b.month==='2026-09').length,2);
 for(const b of m.buckets){const rows=read(b.file);assert(rows.length<=100);assert(rows.every(l=>!('detail'in l)));}
 const out=run('search','--category','data','--month','2026-09','--keyword','审批','--limit','2');
 assert.equal(out.trim().split('\n').length,3);assert(out.includes('命中 151 条'));assert(out.includes('20260901-151'));
 assert.equal(JSON.parse(run('search','--id','20261026-07')).id,'20261026-07');
 assert.throws(()=>run('search','--limit','0'));
 const index=m.buckets[0].file;writeFileSync(join(temp,index),'[]');assert.throws(()=>run('check'));run('build');
 console.log('通过：158 条跨月记录、50 条窗口、100 条分片、三位序号排序、限量检索、单条全文与过期索引拒绝');

 // 在最小 DOM 中执行实际 UI 脚本，验证事件和按需加载，不替代真实浏览器视觉检查。
 const elements=new Map();
 function element(){return {value:'',innerHTML:'',textContent:'',style:{},dataset:{},listeners:{},options:[],add(o){this.options.push(o)},addEventListener(e,f){this.listeners[e]=f},appendChild(){},remove(){}}}
 for(const id of ['status','f-period','f-category','f-type','f-scope','f-kw','stats','timeline','count','empty'])elements.set(id,element());
 elements.get('f-period').value='recent';
 const requested=[],pending=[];
 const document={getElementById:id=>elements.get(id),createElement:()=>element(),head:{appendChild(script){requested.push(script.src);pending.push(script)}}};
 const context=vm.createContext({window:{CHANGELOG_DATA:{}},document,Option:function(text,value){this.text=text;this.value=value},Intl,Date,console,setTimeout,clearTimeout});
 const execute=p=>vm.runInContext(readFileSync(join(temp,p),'utf8'),context);
 execute('changelog/manifest.js');execute('changelog/recent.js');
 vm.runInContext(readFileSync(join(root,'changelog/ui.js'),'utf8'),context);
 assert.equal(requested.length,0);assert(elements.get('count').textContent.includes('50 / 50'));
 elements.get('f-category').value='data';elements.get('f-category').listeners.change();
 assert(elements.get('count').textContent.includes('44 / 50'));
 elements.get('f-category').value='';elements.get('f-kw').value='不存在的关键词';elements.get('f-kw').listeners.input();assert.equal(elements.get('empty').style.display,'block');
 elements.get('f-kw').value='';elements.get('f-kw').listeners.input();
 const detail=element(),item={dataset:{id:recent[0].id},classList:{toggle:()=>true},querySelector:()=>detail};
 const button={closest:()=>item,setAttribute(){}};
 const click=elements.get('timeline').listeners.click({target:{closest:()=>button}});
 assert.equal(requested.length,1);assert(requested[0].includes('/records/'));execute(pending[0].src);pending[0].onload();await click;assert.equal(detail.dataset.loaded,'true');
 // 旧月份慢请求完成后，不能覆盖用户已切回的近期列表。
 elements.get('f-period').value='2026-09';const old=elements.get('f-period').listeners.change();
 elements.get('f-period').value='recent';await elements.get('f-period').listeners.change();
 for(const script of pending.slice(1)){execute(script.src);script.onload()}await old;
 assert(elements.get('count').textContent.includes('50 / 50'));
 elements.get('f-period').value='2026-08';await elements.get('f-period').listeners.change();assert.equal(elements.get('empty').style.display,'block');
 // 加载失败必须提示且可重试。
 elements.get('f-period').value='recent';await elements.get('f-period').listeners.change();
 const retryDetail=element(),retryItem={dataset:{id:recent[1].id},classList:{toggle:()=>true},querySelector:()=>retryDetail};
 const retryButton={closest:()=>retryItem,setAttribute(){}};
 const failed=elements.get('timeline').listeners.click({target:{closest:()=>retryButton}});
 pending.at(-1).onerror();await failed;assert(retryDetail.textContent.includes('加载失败'));assert(!retryDetail.dataset.loaded);
 const retried=elements.get('timeline').listeners.click({target:{closest:()=>retryButton}});
 execute(pending.at(-1).src);pending.at(-1).onload();await retried;assert.equal(retryDetail.dataset.loaded,'true');
 console.log('通过：实际 UI 脚本初始零详情请求、分类/关键词筛选、按条展开、空结果、切换竞态和失败重试');

 const child=spawn(process.execPath,['serve.mjs'],{cwd:root,env:{...process.env,PORT:'15174'},stdio:['ignore','pipe','pipe']});
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('服务启动超时')),5000);child.stdout.once('data',()=>{clearTimeout(timer);resolve()});child.once('error',reject)});
  for(const path of ['/changelog.html','/changelog/ui.js','/changelog/manifest.js','/changelog/recent.js','/changelog/index/2026-10.001.js','/changelog/records/2026-10/20261026-07.js']){
   await new Promise((resolve,reject)=>get('http://127.0.0.1:15174'+path,res=>{res.resume();res.on('end',()=>{try{assert.equal(res.statusCode,200);resolve()}catch(e){reject(e)}})}).on('error',reject));
  }
  console.log('通过：看板、UI、近期/历史索引及详情资源 HTTP 200');
 }finally{child.kill()}
}finally{rmSync(temp,{recursive:true,force:true})}
