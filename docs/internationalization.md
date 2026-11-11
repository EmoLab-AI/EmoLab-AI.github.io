# 中英文内容维护

网站的七个页面共用 `js/i18n.js` 和 `info/i18n/en.json`、`info/i18n/zh-CN.json`，无需构建步骤。

## 语言切换

导航栏的“中文 / EN”按钮即时切换页面内容。语言优先级为 URL 的 `lang` 参数、浏览器中保存的用户选择、浏览器语言、英文默认值。支持 `?lang=zh-CN` 和 `?lang=en`；站内页面链接会保留语言参数。浏览器禁止本地存储时仍可以切换。

切换不重新加载页面。筛选项、论文搜索词与已展开的摘要会保留。页面标题、`html lang`、表单提示、无障碍标签与日期随语言更新。

## 界面文案

新增文案时，在两份词典中添加相同的键，然后标记 HTML：

```html
<h2 data-i18n="members.title">Our Team</h2>
<input data-i18n-placeholder="pub.search" data-i18n-aria-label="pub.search">
```

JavaScript 使用 `I18n.t('members.title')`。短分类、标签与按钮文字使用 `I18n.label('All')`，对应词典中的 `labels.All`。带变量的文案使用 `I18n.t('pub.count', { count: 3, total: 18 })`。

不要在含链接、图标或强调元素的整个父节点上设置 `data-i18n`，以免子节点被替换；分别标记内部文字节点。

## 成员、论文、数据集与相册

原字段继续存放英文，中文放在同一记录的 `translations.zh-CN` 下：

```json
{
  "name": "Example Member",
  "title": "Master",
  "introduction": "English introduction.",
  "translations": {
    "zh-CN": {
      "introduction": "中文简介。",
      "bio": "研究方向：多模态学习"
    }
  }
}
```

渲染字段使用 `I18n.field(record, 'introduction')`，缺少当前语言的字段时回退到原字段。成员中文简介和研究方向、数据集及相册的标题与说明、论文摘要均已补充。

姓名保留已确认的原始写法。论文正式题名、作者、期刊和 BibTeX 保留原文，避免改变正式书目信息。`scripts/update_publications.py` 重新生成记录时会按 DOI（无 DOI 时按题名）保留已有翻译。

项目列表目前为空；以后新增项目可在 `translations.zh-CN` 中填写 `name` 和 `description`。首页存在新闻数据时，从 `info/news.json` 数组读取 `title`、`summary` 及对应中文翻译；没有该文件时，使用现有欢迎与招募提示的双语版本。

## 筛选值

`title`、`status`、`tags`、`category` 等业务值保持稳定，不要直接替换成中文。按钮用 `data-filter` 存放原始筛选值，用 `data-i18n` 翻译显示文字：

```html
<button class="filter-btn" data-filter="Life" data-i18n="labels.Life">Life</button>
```

## 本地检查

从仓库根目录运行：

```powershell
python scripts/check_i18n.py
python -m http.server 8000
```

通过本地 HTTP 服务器打开页面，检查中英文切换、移动端菜单、论文搜索、各页筛选和数据申请弹窗。直接通过 `file://` 打开 HTML 无法正常加载 JSON。

此阶段共用页面，不生成独立的中英文 HTML 路径。
