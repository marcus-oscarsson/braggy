
from aiohttp import web

from braggy.backend.lib.app import init_app
from braggy.backend.routes import filebrowser
from braggy.backend.routes import imageview
from braggy.backend.routes import ws

routes = web.RouteTableDef()


def init_server():
    app = web.Application()
    app.add_routes(filebrowser.routes)
    app.add_routes(imageview.routes)
    ws.sio.attach(app)
    init_app(ws.sio)

    return app
