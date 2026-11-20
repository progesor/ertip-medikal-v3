"""Build installable catalog fonts from the same Fontsource subsets used by the PDF.
Development only: python -m pip install fonttools brotli
Run from repository root. Generated fonts and licenses are committed.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
import tempfile

target = Path("public/catalog-fonts")
target.mkdir(parents=True, exist_ok=True)
for package, family in [("inter", "Ertip Catalog Sans"), ("source-serif-4", "Ertip Catalog Serif")]:
    source = Path("node_modules/@fontsource") / package
    (target / (package + "-LICENSE.txt")).write_bytes((source / "LICENSE").read_bytes())
    for weight, style in [(400, "Regular"), (600, "SemiBold")]:
        with tempfile.TemporaryDirectory() as temp:
            paths = []
            for subset in ["latin", "latin-ext"]:
                font = TTFont(source / "files" / f"{package}-{subset}-{weight}-normal.woff2")
                font.flavor = None
                path = Path(temp) / (subset + ".ttf")
                font.save(path)
                paths.append(str(path))
            font = Merger().merge(paths)
        postscript = family.replace(" ", "") + "-" + style
        for record in list(font["name"].names):
            if record.nameID in [1, 2, 3, 4, 6, 16, 17]:
                font["name"].names.remove(record)
        names = {1: family if weight == 400 else family + " SemiBold", 2: "Regular",
                 3: postscript + ";catalog-1", 4: family + " " + style,
                 6: postscript, 16: family, 17: style}
        for name_id, value in names.items():
            font["name"].setName(value, name_id, 3, 1, 0x409)
        font.flavor = None
        font.save(target / (postscript + ".ttf"))
        assert all(ord(char) in font.getBestCmap() for char in "ÇĞİÖŞÜçğıöşü")
        print(postscript)
