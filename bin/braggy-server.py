# -*- coding:utf-8 -*-
#!/usr/bin/env python
import logging
from aiohttp import web

from braggy.backend import server


if __name__ == '__main__':
    aiohttp_app = server.init_server()
    logging.basicConfig(level=logging.DEBUG)
    web.run_app(aiohttp_app, host='0.0.0.0', port=8080)
