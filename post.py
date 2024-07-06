import sys
import json

def readable_date(date):
    y = date[:4]
    m = date[5:7]
    d = date[8:]

    months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
              'September', 'October', 'November', 'December' ]

    return f'{d} {months[int(m)-1]} {y}'

post, out = sys.argv[1:]

base = open('fragments/base.html').read()
body = open('fragments/post.html').read()

p = json.loads(open(post, 'r').read())
date = p['publishDate']

body = body.format(title=p['title'],
                   publish_datetime=date,
                   publish_date=readable_date(date),
                   content=p['html']
                   )

head = r'<link rel="preload" href="/assets/PlayfairDisplay-Regular.woff2" as="font" type="font/woff2" crossorigin>'
deps = p['dependencies'] or []
for dep in deps:
    src = dep['source']
    kind = dep['kind']

    if kind == 'css':
        head += f'<link href="{src}" rel="stylesheet">\n'
    elif kind == 'javascript':
        head += f'<script src="{src}"></script>\n'

page = base.format(title=p['title'], 
                   head=head, 
                   body=body
                   )

with open(out, 'w') as f:
    f.write(page)

