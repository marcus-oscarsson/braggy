# -*- coding:utf-8 -*-
from aiohttp import web

from braggy.backend.lib import filebrowser

routes = web.RouteTableDef()


@routes.get('/')
async def index(request):
    return web.Response(text="")


@routes.post("/file-browser/list-dir")
async def _list_dir(request):
    params = await request.json()
    content = filebrowser.list_dir(params.get("path", ""))

    return web.json_response(content, status=200)


@routes.post("/file-browser/init")
async def _list_dir(request):
    content = filebrowser.list_dir("")

    return web.json_response(content, status=200)
