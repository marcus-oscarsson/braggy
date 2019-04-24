# -*- coding:utf-8 -*-
from typing import List
from pydantic import BaseModel

class DirListNode(BaseModel):
    text: str
    isLeaf: bool
    fpath: str

class DirList(BaseModel):
    items: List[DirListNode]

class FilePath(BaseModel):
    path: str

class BLParams(BaseModel):
    wavelength: float
    detector_distance: float
    detector_radius: float
