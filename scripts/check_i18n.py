"""Check bilingual UI keys, HTML hooks and content coverage without dependencies."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ('index', 'members', 'publications', 'datasets', 'projects', 'gallery', 'lab-coding')


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8-sig'))


en = read_json('info/i18n/en.json')
zh = read_json('info/i18n/zh-CN.json')
assert en.keys() == zh.keys(), 'Language dictionary keys differ'
assert all(isinstance(value, str) and value.strip() for value in [*en.values(), *zh.values()]), 'Empty UI translation'


class PageCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.i18n_scripts = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, 'Duplicate HTML ID: ' + attrs['id']
            self.ids.add(attrs['id'])
        for name, value in attrs.items():
            if name == 'data-i18n' or name.startswith('data-i18n-'):
                assert value in en, 'Missing UI key: ' + str(value)
        if tag == 'script' and 'js/i18n.js' in attrs.get('src', ''):
            self.i18n_scripts += 1
        if tag == 'button' and 'filter-btn' in attrs.get('class', '').split():
            assert attrs.get('data-filter'), 'Filter depends on visible button text'


for page in PAGES:
    check = PageCheck()
    check.feed((ROOT / (page + '.html')).read_text(encoding='utf-8'))
    assert check.i18n_scripts == 1, 'Missing or duplicate i18n script: ' + page

for path in (ROOT / 'js').glob('*.js'):
    source = path.read_text(encoding='utf-8-sig')
    for key in re.findall(r"I18n\.t\(['\"]([^'\"]+)['\"]\s*[,)]", source):
        assert key in en, f'Missing key {key} in {path.name}'
    assert 'button.textContent.trim()' not in source, 'Filter reads translated button text: ' + path.name

collections = [
    ('info/members/info.json', 'members', ('bio', 'introduction')),
    ('info/datasets/datastes.json', 'datasets', ('title', 'description')),
    ('info/gallery/gallery.json', 'gallery', ('title', 'description')),
    ('info/publications/publications.json', 'publications', ('abstract',)),
]
for path, collection, fields in collections:
    records = read_json(path)[collection]
    for item in records:
        translated = item.get('translations', {}).get('zh-CN', {})
        assert all(translated.get(field) for field in fields), 'Incomplete Chinese content: ' + str(item.get('name') or item.get('title'))
        image = item.get('image') or item.get('avatar')
        if image and not image.startswith(('https:', 'http:')):
            assert (ROOT / image.lstrip('/')).is_file(), 'Missing image: ' + image

print(f'PASS: seven pages, {len(en)} matching bilingual UI keys, stable filter hooks and translated content with valid images.')
