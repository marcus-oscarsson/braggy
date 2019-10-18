# -*- coding:utf-8 -*-
from fastapi import APIRouter

from braggy.backend.app import App
from braggy.backend.models import DirList, FilePath

router = APIRouter()

class FileBrowser():
    def __init__(self):
        self.router = APIRouter()

        self.router.add_api_route(
            "/init",
            self._get_list_dir,
            name="list_dir",
            response_model=DirList,
            methods=["GET"]
        )

        self.router.add_api_route(
            "/list-dir",
            self._post_list_dir,
            name="list_dir",
            response_model=DirList,
            methods=["POST"]
        )

    async def _post_list_dir(self, path: FilePath):
        content = {"items": App().file_browser.list_dir(path.path)}
        return content

    async def _get_list_dir(self):
        content = {"items": App().file_browser.list_dir("")}
        return content