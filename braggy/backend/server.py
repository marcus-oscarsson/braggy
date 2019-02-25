import os
from aiohttp import web

from braggy.backend.lib.app import init_app
from braggy.backend.routes import filebrowser
from braggy.backend.routes import imageview
from braggy.backend.routes import ws

routes = web.RouteTableDef()


def init_server():
    static_files = os.path.abspath(os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "../static/"))

    app = web.Application()

    app.add_routes(filebrowser.routes)
    app.add_routes(imageview.routes)

    app.router.add_static("/static/", os.path.join(static_files, "static/"))

    ws.sio.attach(app, '/api/socket.io')
    init_app(static_files, ws.sio)

    return app
