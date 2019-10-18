# -*- coding:utf-8 -*-
"Functions for browsing the file system"
import os
from subprocess import run, PIPE

from abc import (ABC, abstractmethod)
from braggy.backend.lib.h5utils import h5dump

class AbstractFileBrowserHandler(ABC):
    @abstractmethod
    def is_leaf(self, path):
        pass

    @abstractmethod
    def list_entry(self, path):
        pass


class FSFileBrowserHandler(AbstractFileBrowserHandler):
    EXCLUDE_EXT = [".h5", "hdf", "hdf5"]

    def __init__(self):
        pass

    def is_leaf(self, path):
        res = False
        _root, ext = os.path.splitext(path)

        if os.path.isfile(path):
            if ext in FSFileBrowserHandler.EXCLUDE_EXT:
                res = False
            else:
                res = True

        return res

    def list_entry(self, path):
        files = []

        if os.path.isdir(path): 
            files = os.listdir(path)

        return files


class HDF5FileBrowserHandler(AbstractFileBrowserHandler):
    def __init__(self):
        pass

    def is_leaf(self, path):
        _root, ext = os.path.splitext(path)
        res = False
        
        if ext == ".dataset":
            res = True
        
        return res

    def list_entry(self, path):
        files = []

        if os.path.isfile(path):
            _root, ext = os.path.splitext(path)

            if ext == '.h5':
                data = h5dump(path)
                image_nr_low = data['/entry/data/data/image_nr_low']
                image_nr_high = data['/entry/data/data/image_nr_high']
                files = []

                for n in range(image_nr_low, image_nr_high + 1):
                    files.append('image_%s%s.dataset' % (n, ext))

                return files

class FileBrowser():
    ROOT_PATH = ""
    EXTENSIONS = []

    def __init__(self):
        self._handlers = []

    def register_handler(self, handler):
        self._handlers.append(handler)

    def _is_leaf(self, path):
        res = False

        for h in self._handlers:
            if h.is_leaf(path):
                res = True
                break

        return res

    def _list_entry(self, path):
        l = []

        for h in self._handlers:
            l = h.list_entry(path) 

            if l:
                break

        return l

    def list_dir(self, path="."):
        path = os.path.normpath(path)
        abs_path = os.path.join(FileBrowser.ROOT_PATH, path)
        nodes = []

        # Restrict listing to root folder
        if os.path.normpath(abs_path) == FileBrowser.ROOT_PATH:
            path, abs_path = '.', FileBrowser.ROOT_PATH
        else:
            nodes.append({"text": "..", "isLeaf": False, "fpath": os.path.join(abs_path, "..")})

        if self._is_leaf(abs_path):
            abs_path = os.path.dirname(abs_path)

        for entry in self._list_entry(abs_path):
            fpath = os.path.join(abs_path, entry)

            if self._is_leaf(fpath):
                _root, ext = os.path.splitext(fpath)

                if ext in FileBrowser.EXTENSIONS:
                    nodes.append({"text": entry, "fpath": fpath, "isLeaf": True})

            else:
                nodes.append({"text": entry, "isLeaf": False, "fpath": fpath})

        return nodes


def listdir_shell(path, *lsargs):
    t = run(('ls', path) + lsargs, stdout=PIPE, close_fds=True, shell=False)
    return [p.decode("utf-8") for p in t.stdout.splitlines()]
