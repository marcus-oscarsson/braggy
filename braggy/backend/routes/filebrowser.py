# -*- coding:utf-8 -*-
import os

from fastapi import APIRouter
from starlette.responses import FileResponse

from braggy.backend.lib import filebrowser
from braggy.backend.app import App
from braggy.backend.models import DirList, FilePath

router = APIRouter()

@router.get('/')
async def index():
    static_path = App().static_path
    return FileResponse(os.path.join(static_path, 'index.html'))

@router.post("/api/file-browser/list-dir", response_model=DirList)
async def _list_dir(path: FilePath):
    content = {"items": filebrowser.list_dir(path.path)}
    return content

@router.get("/api/file-browser/init", response_model=DirList)
async def _list_dir():
    content = {"items": filebrowser.list_dir("")}
    return content
