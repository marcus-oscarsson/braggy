#import gevent
#from gevent import monkey; monkey.patch_all()
#gevent.config.loop = "libuv"

import asyncio
import uvicorn
from uvicorn.loops.uvloop import uvloop_setup


from braggy.backend import server

async def start_uvicorn():
    app = server.init_server()
    uvicorn.run(app, host='0.0.0.0', port=8000)

async def run_gevent():
    gevent.get_hub().loop.run(nowait=True, once=True)
    await asyncio.sleep(1)

async def main(loop):
    ge_task = loop.create_task(run_gevent())
    uv_task = loop.create_task(start_uvicorn())
    await asyncio.wait([uv_task, ge_task])

#if __name__ == '__main__':
#    uvloop_setup()
#    loop = asyncio.get_event_loop()
#    loop.run_until_complete(main(loop))
#    loop.close()

if __name__ == '__main__':
    app = server.init_server()
    uvicorn.run(app, host='0.0.0.0', port=8080)