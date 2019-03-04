# -*- coding:utf-8 -*-
import zlib

from aiohttp import web

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

    _raw_data = zlib.compress(_raw_data, 1)

    return web.Response(body=_raw_data, status=200,
                        content_type="application/octet-stream",
                        headers={
                            "Content-Encoding": "deflate"
                        })


@routes.post("/api/imageview/hdr")
async def _get_image(request):
    params = await request.json()
    img_path = get_app().abs_data_path(params.get("path", ""))
    _img_hdr = readimage.get_image_hdr(img_path)

    return web.json_response(_img_hdr, status=200)


@routes.get("/api/imageview/show-image")
async def _show_image(request):
    app = get_app()

    if app.follow_enabled():
        path = request.rel_url.query['path']
        img_path = get_app().abs_data_path(path)
        _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

        await get_app().sio.emit("show-image", {"path": img_path})
        status = 200
        response = {"msg": "OK"}
    else:
        response = {"msg": "FOLLOW NOT ENABLED"}
        status = 400

    return web.json_response(response, status=status)


@routes.post("/api/imageview/start-follow")
async def _start_follow(request):
    app = get_app()
    params = await request.json()

    wavelength = params.get("wavelength", 0)
    detector_distance = params.get("detector_distance", 0)
    detector_radius = params.get("detector_diameter", 0)

    app.follow_set_bl_params(wavelength, detector_distance, detector_radius)
    app.follow_start()
    return web.json_response({}, status=200)


@routes.post("/api/imageview/stop-follow")
async def _stop_follow(request):
    app = get_app()
    app.follow_stop()
    return web.json_response({}, status=200)
