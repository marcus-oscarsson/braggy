# -*- coding:utf-8 -*-
import os

from aiohttp import web

from braggy.backend.lib import readimage
from braggy.backend.lib.app import get_app

routes = web.RouteTableDef()


@routes.post("/imageview/preload")
async def _get_image(request):
    APP_CONFIG = get_app().CONFIG

    params = await request.json()
    path = os.path.normpath(params.get("path", ""))
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)

    # Call to get_image_data caches image data
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.json_response(_img_hdr, status=200)


@routes.get("/imageview/image")
async def _get_image(request):
    APP_CONFIG = get_app().CONFIG
    path = request.rel_url.query['path']
    path = os.path.normpath(path)
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)

    _img_hdr, _raw_data, img_data = readimage.get_image_data(img_path)

    return web.Response(body=img_data, status=200,
                        content_type="image/gif")


@routes.post("/imageview/raw")
async def _get_image_raw_data(request):
    APP_CONFIG = get_app().CONFIG

    params = await request.json()
    path = os.path.normpath(params.get("path", ""))
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.Response(body=_raw_data, status=200,
                        content_type="application/octet-stream")


@routes.post("/imageview/hdr")
async def _get_image(request):
    APP_CONFIG = get_app().CONFIG

    params = await request.json()
    path = os.path.normpath(params.get("path", ""))
    img_path = os.path.join(APP_CONFIG.get("DATA_PATH"), path)
    img_hdr = readimage.get_image_hdr(img_path)

    return web.json_response(img_hdr, status=200)
