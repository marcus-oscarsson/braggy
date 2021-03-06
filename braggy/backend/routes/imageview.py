# -*- coding:utf-8 -*-
import zlib
import lz4.frame

from fastapi import APIRouter
from starlette.responses import Response

from braggy.backend.lib import readimage
from braggy.backend.app import App
from braggy.backend.models import FilePath, BLParams

class ImageReader():
    def __init__(self):
        self.router = APIRouter()

        self.router.add_api_route(
            "/preload",
            self._preload_image,
            name="preload_image",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/image",
            self._get_image,
            name="get_image",
            methods=["GET"]
        )

        self.router.add_api_route(
            "/image",
            self._get_image_bin,
            name="get_image",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/raw-subs",
            self._get_image_raw_subs,
            name="raw-subs",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/raw-full",
            self._get_image_raw_full,
            name="raw-full",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/hdr",
            self._get_image_hdr,
            name="hdr",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/show-image",
            self._show_image,
            name="show-image",
            methods=["GET"]
        )

        self.router.add_api_route(
            "/start-follow",
            self._start_follow,
            name="start_follow",
            methods=["POST"]
        )

        self.router.add_api_route(
            "/stop-follow",
            self._stop_follow,
            name="stop_follow",
            methods=["GET"]
        )


    async def _preload_image(self, fp: FilePath):
        img_path = App().abs_data_path(fp.path)
        hdr = App().file_reader.preload(img_path)

        # Call to get_image_data caches image data to enable parallel download of
        # full and subsampled data sets. The data is read once and fecthed by
        # simultaneoulsy by two different requests.

        return hdr


    async def _get_image(self, path: str):
        img_path = App().abs_data_path(path)
        data = App().file_reader.get_data(img_path, "png")
        return Response(data, media_type='image/png')


    async def _get_image_bin(self, fp: FilePath):
        img_path = App().abs_data_path(fp.path)
        data = App().file_reader.get_data(img_path, "png")

        return Response(data,
                        media_type="application/octet-stream")


    async def _get_image_raw_subs(self, fp: FilePath):
        img_path = App().abs_data_path(fp.path)
        data = App().file_reader.get_data(img_path, "preview")

        data = lz4.frame.compress(data)

        return Response(data,
                        media_type="application/octet-stream")


    async def _get_image_raw_full(self, fp: FilePath):
        img_path = App().abs_data_path(fp.path)
        raw_data = App().file_reader.get_data(img_path, "raw")

        return Response(raw_data,
                        #headers={
                        #    "Content-Encoding": "deflate"
                        #},
                        media_type="application/octet-stream")


    async def _get_image_hdr(self, fp: FilePath):
        img_path = App().abs_data_path(fp.path)
        _img_hdr = App().file_reader.get_hdr(img_path)

        return _img_hdr


    async def _show_image(self, path: str):
        app = App()

        if app.follow_enabled():
            img_path = App().abs_data_path(path)
            App().file_reader.preload(img_path)

            await App().sio.emit("show-image", {"path": img_path})
            status = 200
            response = {"msg": "OK"}
        else:
            response = {"msg": "FOLLOW NOT ENABLED"}
            status = 400

        return response, status


    async def _start_follow(self, p: BLParams):
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


    async def _stop_follow(self):
        app = App()

        await App().sio.emit("set-follow", {
            "follow": False,
            "wavelength": "null",
            "detector_distance": "null",
            "detector_radius": "null"
        })

        app.follow_stop()
        return {}
