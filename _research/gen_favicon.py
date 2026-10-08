# -*- coding: utf-8 -*-
"""favicon.ico в app/: Chrome запрашивает /favicon.ico даже при наличии icon.svg."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_icons import drop  # noqa: E402

APP = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app'))
ico = drop(64)
ico.save(os.path.join(APP, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print("ok app/favicon.ico")
