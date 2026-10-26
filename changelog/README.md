# 更新日志归档与检索

看板入口为根目录 changelog.html。UI 在 ui.js；records/YYYY-MM/<id>.json 是唯一手工维护数据源。保留双击打开与静态服务两种方式，无 CDN 依赖。

分类与 type 分开：ui 界面；data 字段、字典、接口、状态与业务规则；docs 文档交接；engineering 工程运行。一条记录可多分类，例如 UI 新字段及其校验应标记 ["ui", "data"]。

## 新增记录

新建 records/YYYY-MM/<id>.json，字段示例：

```json
{
  "id": "20261026-08",
  "date": "2026-10-26",
  "time": "12:00",
  "type": "fix",
  "scope": "passenger-injury",
  "categories": ["ui", "data"],
  "tags": ["客伤", "审批", "passenger-injury-register"],
  "title": "此处为示例标题，非实际变更",
  "detail": "改了什么：…\n为什么改：…\n验证方式：未验证及原因或实际证据",
  "pages": ["passenger-injury-register"],
  "author": "AI·Agent"
}
```

编号必须查当日已有最大序号后加一，示例不可直接照用。新增标题最多 30 字，标签必须非空。历史记录不重写，更正用新记录引用旧编号。

运行 `node scripts/changelog.mjs build` 后执行 `node scripts/check-docs.mjs`。生成的 manifest/recent/index/*.json 及全部同名 JS 副本不可手改；JS 副本只为 file:// 兼容，与 JSON 内容由检查程序保持一致。

## 归档与容量

全文按月份、编号永久保存，每条只保留一个 JSON 源。recent.json 只存最近 50 条摘要，旧条目自动退出近期窗口，但仍在月索引中。index/YYYY-MM.NNN.json 每片最多 100 条，不复制 detail。manifest.json 只保存分片位置、数量和分类/模块信息。

归档不删除历史、不合并全文、不将历史事实压缩为不可恢复的摘要。每次 build 自动更新近期窗口和索引；check 拒绝源与生成副本不一致。旧生成片不被 manifest 引用时不参与检索；禁止未经授权清理文件。当前体量 build/check 全量扫描用于一致性验证，日常 search 只读必要摘要，不读全文。

## 智能体读取顺序

1. 先用分类、月份、模块缩小范围：`node scripts/changelog.mjs search --category docs --keyword 交接 --limit 10`。
2. 可组合 `--month 2026-10 --scope docs --type docs`；全历史搜索由程序扫描匹配摘要分片，默认只输出 10 条，最多 50 条。
3. 用 `node scripts/changelog.mjs search --id 20261026-07` 获取单条全文。
4. 零命中时换业务词、页面标识或扩大分类范围；摘要搜索不含 detail，不代表全文无匹配。标签应补充业务同义词以改善命中。

看板按最近 50 条或月份检索，筛选和关键词仅作用于所选范围的摘要；展开才加载详情。缺文件会提示，重新选择范围或再次展开可重试。看板没有跨月全文搜索，必要时用上述命令定位。分类统计可多选，不能把分类数量相加当作总条数。
