# -*- coding:utf-8 -*-
import logging
import socketio

class ConnectNS(socketio.AsyncNamespace):
    @staticmethod
    def on_connect(sid, environ):
        logging.debug("Websocket connected %s", sid)

    @staticmethod
    def on_disconnect(sid):
        logging.debug("Websocket disconnected %s", sid)
