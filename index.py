import sys

base = open('fragments/base.html').read()
content = open('fragments/index.html').read()

page = base.format(title="David Bos", head="", body=content)

out = sys.argv[1]

with open(out, 'w') as f:
    f.write(page)

