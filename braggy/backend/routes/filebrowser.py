# -*- coding:utf-8 -*-
import os
from aiohttp import web

from braggy.backend.lib import filebrowser
from braggy.backend.lib.app import get_app

routes = web.RouteTableDef()


@routes.get('/')
async def index(request):
    static_path = get_app().static_path
    return web.FileResponse(os.path.join(static_path, 'index.html'))


@routes.post("/api/file-browser/list-dir")
async def _list_dir(request):
    params = await request.json()
    content = filebrowser.list_dir(params.get("path", ""))

    return web.json_response(content, status=200)


@routes.post("/api/file-browser/init")
async def _list_dir(request):
    content = filebrowser.list_dir("")

    return web.json_response(content, status=200)
