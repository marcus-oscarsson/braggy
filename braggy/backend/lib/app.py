# -*- coding: utf-8 -*-
""" Application wide functionality and configuration"""

import os
import configparser
import logging

# Application instance
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

    def __init__(self):
        self.read_config()


def init_app():
    """ Initializes the application instance """
    global APP

    if not APP:
        APP = Application()

    return APP


def get_app():
    """ Returns the application instance """
    return init_app()
