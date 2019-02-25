# -*- coding:utf-8 -*-
from aiohttp import web
import datetime

from braggy.backend.lib import readimage
from braggy.backend.lib.app import get_app

routes = web.RouteTableDef()


@routes.post("/api/imageview/preload")
async def _preload_image(request):
    params = await request.json()
    img_path = get_app().abs_data_path(params.get("path", ""))

    # Call to get_image_data caches image data
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.json_response(_img_hdr, status=200)


@routes.get("/api/imageview/image")
async def _get_image(request):
    path = request.rel_url.query['path']
    img_path = get_app().abs_data_path(path)

    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.Response(body=_img_data, status=200,
                        content_type="image/png")


@routes.post("/api/imageview/image")
async def _get_image_post(request):
    params = await request.json()
    img_path = get_app().abs_data_path(params.get("path", ""))
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.Response(body=_img_data, status=200,
                        content_type="application/octet-stream")


@routes.post("/api/imageview/raw")
async def _get_image_raw_data(request):
    params = await request.json()
    img_path = get_app().abs_data_path(params.get("path", ""))

    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    return web.Response(body=_raw_data, status=200,
                        content_type="application/octet-stream")


@routes.post("/api/imageview/hdr")
async def _get_image(request):
    params = await request.json()
    img_path = get_app().abs_data_path(params.get("path", ""))

    _img_hdr = readimage.get_image_hdr(img_path)

    return web.json_response(_img_hdr, status=200)


@routes.get("/api/imageview/show-image")
async def _show_image(request):
    path = request.rel_url.query['path']
    img_path = get_app().abs_data_path(path)
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    await get_app().sio.emit("show-image", {"path": img_path})

    return web.json_response({}, status=200)
