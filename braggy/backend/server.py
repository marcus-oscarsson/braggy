
from aiohttp import web

from braggy.backend.routes import filebrowser
from braggy.backend.routes import imageview
from braggy.backend.lib.app import init_app

routes = web.RouteTableDef()


def init_server():
    app = web.Application()
    app.add_routes(filebrowser.routes)
    app.add_routes(imageview.routes)
    init_app()

    return app
