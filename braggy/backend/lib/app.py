# -*- coding: utf-8 -*-
""" Application wide functionality and configuration"""

import os
import configparser
import logging

APP = None


class Application():
    """ Encapsulates all application wide data """

    CONFIG = {
        "DATA_PATH": os.path.expanduser("~"),
        "EXTENSIONS": [".cbf"]
    }

    DEFAULT_CONFIG_FPATHS = [os.path.expanduser("~/braggy.ini")]

    @staticmethod
    def read_config():
        fpath = None

        for path in Application.DEFAULT_CONFIG_FPATHS:
            if os.path.isfile(path):
                fpath = path
                break

        if fpath:
            config = configparser.ConfigParser()
            config.read(fpath)

            try:
                data_path = os.path.normpath(config["Braggy"]["path"])

                if '~' in data_path:
                    data_path = os.path.expanduser(data_path)

            except KeyError:
                msg = "No path set, using default %s:" % Application.CONFIG["DATA_PATH"]
                logging.info(msg)
            else:
                Application.CONFIG["DATA_PATH"] = data_path

    @staticmethod
    def abs_data_path(path):
        path = os.path.normpath(path)
        return os.path.join(Application.CONFIG.get("DATA_PATH"), path)

    def __init__(self, sio):
        self.read_config()
        self.sio = sio


def init_app(sio):
    """ Initializes the application instance """
    global APP

    if not APP:
        APP = Application(sio)

    return APP


def get_app():
    """ Returns the application instance """
    return APP
