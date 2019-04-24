import os
import socketio

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from braggy.backend.app import App
from braggy.backend.routes import filebrowser, imageview
from braggy.backend.routes import ws


def init_server():
    static_files = os.path.abspath(os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "../static/"))

    app = FastAPI(debug=True)
    app.mount("/static", StaticFiles(directory=static_files))
    app.include_router(filebrowser.router)
    app.include_router(imageview.router)

    sio = socketio.AsyncServer(async_mode='asgi')
    sio_asgi_app = socketio.ASGIApp(sio, app, socketio_path="/api/socket.io")

    sio.register_namespace(ws.ConnectNS('/'))

    App.init_app(static_files, sio)

    return sio_asgi_app
