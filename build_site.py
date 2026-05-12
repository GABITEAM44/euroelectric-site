with open('D:/CLAUDE/SITEWEB/logo_src.txt', 'r') as f:
    logo_src = f.read().strip()

html = open('D:/CLAUDE/SITEWEB/site_template.html', 'r', encoding='utf-8').read()
html = html.replace('LOGO_SRC_PLACEHOLDER', logo_src)

with open('D:/CLAUDE/SITEWEB/euroelectric-nou.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done! Size:', len(html), 'bytes')
