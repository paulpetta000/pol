# Prepara i font del sito a partire dai pacchetti Fontsource (licenza SIL OFL 1.1).
# Archivo: tengo solo pesi 400-900 e larghezze 62-100, e i caratteri latini che servono.
# IBM Plex Mono: copio i file così come sono (nome riservato "Plex": niente modifiche).
# Uso: python3 scripts/font/prepara.py
import shutil
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

src = 'node_modules/@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2'
f = TTFont(src)
f = instancer.instantiateVariableFont(f, {'wght': (400, 900), 'wdth': (62, 100)})
opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'case', 'ccmp', 'locl', 'mark', 'mkmk']
opts.name_IDs = ['*']
opts.notdef_outline = True
unicodes = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x20AC, 0x2022, 0x00B7, 0x2032, 0x2033, 0x2192, 0x2190, 0x2191, 0x2193, 0x2212, 0x00D7, 0x2009, 0x202F, 0x0152, 0x0153, 0x0160, 0x0161, 0x017D, 0x017E, 0x0178]
s = subset.Subsetter(opts)
s.populate(unicodes=unicodes)
s.subset(f)
f.flavor = 'woff2'
f.save('public/fonts/archivo-var.woff2')
for w in (500, 600):
    shutil.copy(f'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-{w}-normal.woff2', f'public/fonts/ibm-plex-mono-{w}.woff2')
print('ok')
