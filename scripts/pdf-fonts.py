"""Static weights of Author, for the PDF.

pdf-lib embeds a font file; it does not instantiate a variable one, and the
web build ships Author as a variable woff2. This writes the two weights the
curriculum vitae uses as TrueType, next to the OpenType faces the share images
already needed.

Run it again only when the variable file changes:

    python scripts/pdf-fonts.py
"""

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = "src/fonts/Author-Variable.woff2"
TARGET = "src/fonts/pdf"

for weight, name in ((400, "Author-Regular"), (600, "Author-Semibold")):
    font = TTFont(SOURCE)
    static = instancer.instantiateVariableFont(font, {"wght": weight})
    static.flavor = None
    static.save(f"{TARGET}/{name}.ttf")
    print(f"{name}.ttf written")
