# -*- coding:utf-8 -*-
"Functions for browsing the file system"

import os

from subprocess import run, PIPE

from braggy.backend.lib.app import get_app


def list_dir(path="."):
    APP_CONFIG = get_app().CONFIG

    path = os.path.normpath(path)
    abs_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)
    nodes = []

    if os.path.normpath(abs_path) == APP_CONFIG.get("DATA_PATH"):
        path, abs_path = '.', APP_CONFIG.get("DATA_PATH")
    else:
        nodes.append({"text": "..", "fpath": os.path.join(abs_path, "..")})

    if os.path.isfile(abs_path):
        abs_path = os.path.dirname(abs_path)

    for entry in os.listdir(abs_path):
        fpath = os.path.join(abs_path, entry)

        if os.path.isfile(fpath):
            _root, ext = os.path.splitext(fpath)

            if ext in APP_CONFIG.get("EXTENSIONS"):
                nodes.append({"text": entry, "fpath": fpath, "isLeaf": True})

        else:
            nodes.append({"text": entry, "isLeaf": False, "fpath": fpath})

    return nodes


def listdir_shell(path, *lsargs):
    t = run(('ls', path) + lsargs, stdout=PIPE, close_fds=True, shell=False)
    return [p.decode("utf-8") for p in t.stdout.splitlines()]
