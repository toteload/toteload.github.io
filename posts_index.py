import sys
import json
import os.path

*posts, out = sys.argv[1:]

base = open('fragments/base.html').read()

entries = []

for f in posts:
    p     = json.loads(open(f).read())
    draft = p['isDraft']

    if draft:
        continue

    url   = '/posts/' + os.path.basename(f)[:-5]
    date  = p["publishDate"]
    entry = f'<div class="post-entry"><time>{date}</time><a href="{url}">{p["title"]}</a></div>'

    entries.append((date, entry))

entries = map(lambda x: x[1], sorted(entries, key=lambda x: x[0], reverse=True))

body = f'<div id="posts-list">{"\n".join(entries)}</div>'

page = base.format(title="Posts", head="", body=body)

with open(out, 'w') as f:
    f.write(page)

