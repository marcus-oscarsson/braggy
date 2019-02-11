# -*- coding:utf-8 -*-
import os

from aiohttp import web

from braggy.backend.lib import readimage
from braggy.backend.lib.app import get_app

routes = web.RouteTableDef()


@routes.post("/imageview/get-image")
async def _get_image(request):
    APP_CONFIG = get_app().CONFIG

    params = await request.json()
    path = os.path.normpath(params.get("path", ""))
    compress = params.get("compress", False)
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)

    fmt = "gif" if compress else "bmp"

    img_data, _img_hdr = readimage.get_image_data(img_path, fmt)
    return web.Response(body=img_data, status=200,
                        content_type="application/octet-stream")


@routes.post("/imageview/get-image-header")
async def _get_image(request):
    APP_CONFIG = get_app().CONFIG

    params = await request.json()
    path = os.path.normpath(params.get("path", ""))
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)

    _img_data, img_hdr = readimage.get_image_data(img_path)

    return web.json_response(img_hdr, status=200)
