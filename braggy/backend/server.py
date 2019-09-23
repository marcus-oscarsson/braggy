# -*- coding:utf-8 -*-
import os
import socketio
import logging

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from braggy.backend.app import App
from braggy.backend.routes import main
from braggy.backend.routes import ws
from braggy.backend.routes.filebrowser import FileBrowser
from braggy.backend.routes.imageview import ImageReader

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('braggy')
logger.setLevel(logging.DEBUG)

def init_server():
    static_files = os.path.abspath(os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "../static/"))

    app = FastAPI(debug=True)
    app.mount("/static", StaticFiles(directory=static_files))
    app.include_router(main.router)
 
    fb = FileBrowser()
    imr = ImageReader()

    app.include_router(fb.router, prefix="/api/file-browser")
    app.include_router(imr.router, prefix="/api/imageview")

    sio = socketio.AsyncServer(async_mode='asgi')
    sio_asgi_app = socketio.ASGIApp(sio, app, socketio_path="/api/socket.io")

    sio.register_namespace(ws.ConnectNS('/'))

    App.init_app(static_files, sio)

    return sio_asgi_app
