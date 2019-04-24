# -*- coding:utf-8 -*-
import zlib
import lz4.frame

from fastapi import APIRouter
from starlette.responses import Response

from braggy.backend.lib import readimage
from braggy.backend.app import App
from braggy.backend.models import FilePath, BLParams

router = APIRouter()

@router.post("/api/imageview/preload")
async def _preload_image(fp: FilePath):
    img_path = App().abs_data_path(fp.path)

    # Call to get_image_data caches image data to enable parallel download of
    # full and subsampled data sets. The data is read once and fecthed by
    # simultaneoulsy by two different requests.
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path, fmt="raw")

    return _img_hdr


@router.get("/api/imageview/image")
async def _get_image(path:str):
    img_path = App().abs_data_path(path)

    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path, fmt="png")
    return Response(_img_data, media_type='image/png')


@router.post("/api/imageview/image")
async def _get_image_post(fp: FilePath):
    img_path = App().abs_data_path(fp.path)
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path, fmt="png")

    return Response(_img_data,
                    media_type="application/octet-stream")


@router.post("/api/imageview/raw-subs")
async def _get_image_post(fp: FilePath):
    img_path = App().abs_data_path(fp.path)
    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path, fmt="raw")

    _img_data = lz4.frame.compress(_img_data)

    return Response(_img_data,
                    media_type="application/octet-stream")


@router.post("/api/imageview/raw-full")
async def _get_image_raw_data(fp: FilePath):
    img_path = App().abs_data_path(fp.path)

    _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

    _raw_data = zlib.compress(_raw_data, 1)

    return Response(_raw_data,
                    media_type="application/octet-stream",
                    headers={
                        "Content-Encoding": "deflate"
                    })


@router.post("/api/imageview/hdr")
async def _get_image(fp: FilePath):
    img_path = App().abs_data_path(fp.path)
    _img_hdr = readimage.get_image_hdr(img_path)

    return _img_hdr


@router.get("/api/imageview/show-image")
async def _show_image(path: str):
    app = App()

    if app.follow_enabled():
        img_path = App().abs_data_path(path)
        _img_hdr, _raw_data, _img_data = readimage.get_image_data(img_path)

        await App().sio.emit("show-image", {"path": img_path})
        status = 200
        response = {"msg": "OK"}
    else:
        response = {"msg": "FOLLOW NOT ENABLED"}
        status = 400

    return response, status


@router.post("/api/imageview/start-follow")
async def _start_follow(p: BLParams):
    app = App()

    await App().sio.emit("set-follow", {
        "follow": True,
        "wavelength": p.wavelength,
        "detector_distance": p.detector_distance,
        "detector_radius": p.detector_radius
    })

    app.follow_set_bl_params(p.wavelength, p.detector_distance, p.detector_radius)
    app.follow_start()
    return {}


@router.get("/api/imageview/stop-follow")
async def _stop_follow():
    app = App()

    await App().sio.emit("set-follow", {
        "follow": False,
        "wavelength": "null",
        "detector_distance": "null",
        "detector_radius": "null"
    })

    app.follow_stop()
    return {}
