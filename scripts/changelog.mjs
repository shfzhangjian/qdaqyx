import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const categories=['ui','data','docs','engineering'];
const types=['feat','fix','migrate','docs','style','chore','revert'];
const json=v=>JSON.stringify(v,null,2)+'\n';
const sort=(a,b)=>b.date.localeCompare(a.date)||Number(b.id.split('-')[1])-Number(a.id.split('-')[1]); // ID 是日志录入顺序，历史时间不作为改写依据。
function assert(ok,msg){if(!ok)throw new Error(msg)}
export function validate(l){
 for(const k of ['id','date','time','type','scope','title','detail','author'])assert(typeof l[k]==='string'&&l[k].trim(),`缺字段 ${k}`);
 assert(/^\d{8}-\d{2,}$/.test(l.id)&&l.id.slice(0,8)===l.date.replaceAll('-',''),`日期编号不符 ${l.id}`);
 assert(/^\d{4}-\d{2}-\d{2}$/.test(l.date)&&new Date(l.date).toISOString().slice(0,10)===l.date,`日期非法 ${l.id}`);
 assert(/^([01]\d|2[0-3]):[0-5]\d$/.test(l.time),`时间非法 ${l.id}`);
 assert(types.includes(l.type),`类型非法 ${l.id}`);
 assert(l.title.length<=30||/^20261026-0[1-6]$/.test(l.id),`新增标题超过30字 ${l.id}`);
 for(const k of ['pages','categories','tags'])assert(Array.isArray(l[k])&&l[k].length&&l[k].every(x=>typeof x==='string'&&x.trim()),`缺少有效数组 ${k}`);
 assert(l.categories.every(x=>categories.includes(x))&&new Set(l.categories).size===l.categories.length,`分类非法 ${l.id}`);
}
function loadRecords(){
 const base='changelog/records';const all=[];
 for(const month of readdirSync(resolve(root,base)).sort()){
  assert(/^\d{4}-\d{2}$/.test(month),`非法归档目录 ${month}`);
  for(const name of readdirSync(resolve(root,base,month)).filter(x=>x.endsWith('.json'))){
   const file=`${base}/${month}/${name}`,l=read(file);validate(l);
   assert(name===`${l.id}.json`&&month===l.date.slice(0,7),`归档路径不符 ${file}`);all.push({...l,file});
  }
 }
 assert(new Set(all.map(x=>x.id)).size===all.length,'重复日志编号');return all.sort(sort);
}
function artifacts(all){
 const output={};
 function put(path,value){output[path]=json(value);output[path.replace(/\.json$/,'.js')]=`window.CHANGELOG_DATA=window.CHANGELOG_DATA||{};window.CHANGELOG_DATA[${JSON.stringify(path)}]=${JSON.stringify(value)};\n`;}
 const summary=l=>Object.fromEntries(['id','date','time','type','scope','title','pages','author','categories','tags','file'].map(k=>[k,l[k]]));
 const recent=all.slice(0,50).map(summary);put('changelog/recent.json',recent);
 const groups={};for(const l of all)(groups[l.date.slice(0,7)]??=[]).push(l);
 const buckets=[];
 for(const [month,rows] of Object.entries(groups))for(let start=0;start<rows.length;start+=100){
  const part=rows.slice(start,start+100),file=`changelog/index/${month}.${String(start/100+1).padStart(3,'0')}.json`;
  put(file,part.map(summary));
  buckets.push({month,file,count:part.length,categories:[...new Set(part.flatMap(l=>l.categories))],scopes:[...new Set(part.map(l=>l.scope))]});
 }
 const counts=Object.fromEntries(categories.map(c=>[c,all.filter(l=>l.categories.includes(c)).length]));
 put('changelog/manifest.json',{version:1,total:all.length,recentLimit:50,shardLimit:100,categories:counts,buckets});
 // 详情按条加载，JSON 是唯一手工维护源，JS 为双击打开的生成副本。
 for(const l of all){const {file,...value}=l;output[file.replace(/\.json$/,'.js')]=`window.CHANGELOG_DATA=window.CHANGELOG_DATA||{};window.CHANGELOG_DATA[${JSON.stringify(file)}]=${JSON.stringify(value)};\n`;}
 return output;
}
const [command='help',...args]=process.argv.slice(2);
const option=k=>{const i=args.indexOf('--'+k);return i<0?'':args[i+1]||''};
if(command==='build'||command==='check'){
 const all=loadRecords(),generated=artifacts(all);
 for(const [path,value] of Object.entries(generated)){
  if(command==='check')assert(existsSync(resolve(root,path))&&readFileSync(resolve(root,path),'utf8')===value,`生成文件过期：${path}，请运行 build`);
  else{mkdirSync(dirname(resolve(root,path)),{recursive:true});writeFileSync(resolve(root,path),value)}
 }
 console.log(`${command} 通过：${all.length} 条记录，近期最多 50 条，索引每片最多 100 条`);
}else if(command==='search'){
 const limit=Number(option('limit')||10);assert(Number.isInteger(limit)&&limit>=1&&limit<=50,'limit 须为 1–50');
 if(option('id')){
  const id=option('id');assert(/^\d{8}-\d{2,}$/.test(id),'非法 ID');
  const file=`changelog/records/${id.slice(0,4)}-${id.slice(4,6)}/${id}.json`;console.log(json(read(file)));
 }else{
  const m=read('changelog/manifest.json'),kw=option('keyword').toLowerCase();let hits=0,shown=0;
  for(const b of m.buckets){
   if(option('month')&&b.month!==option('month'))continue;
   if(option('category')&&!b.categories.includes(option('category')))continue;
   if(option('scope')&&!b.scopes.includes(option('scope')))continue;
   for(const l of read(b.file)){
    if(option('category')&&!l.categories.includes(option('category')))continue;
    if(option('scope')&&l.scope!==option('scope'))continue;
    if(option('type')&&l.type!==option('type'))continue;
    if(kw&&!JSON.stringify([l.title,l.tags,l.pages,l.scope,l.id]).toLowerCase().includes(kw))continue;
    hits++;if(shown++<limit)console.log(JSON.stringify(l));
   }
  }
  console.log(`命中 ${hits} 条，最多输出 ${limit} 条摘要；用 --id 获取单条全文。关键词仅匹配摘要/标签，不搜索详情。`);
 }
}else console.log('node scripts/changelog.mjs build | check | search [--category ui|data|docs|engineering] [--month YYYY-MM] [--scope 模块] [--type fix] [--keyword 词] [--limit 10] [--id 编号]');
