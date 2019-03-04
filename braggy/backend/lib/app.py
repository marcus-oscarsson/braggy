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
        "EXTENSIONS": [".cbf", ".h5"]
    }

    DEFAULT_CONFIG_FPATHS = [os.path.expanduser("~/braggy.ini")]

    OPTIONS = {
        "FOLLOW_MODE": {
            "ENABLED": False,
            "BL_PARAMS": {
                "WAVELENGTH": 0,
                "DETECTOR_DISTANCE": 0,
                "DETECTOR_RADIUS": 0
            },
            "FRAME_COUNT": 0
        }
    }

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

    @staticmethod
    def follow_set_bl_params(wl, dd, dr):
        bl_params = Application.OPTIONS["FOLLOW_MODE"]["BL_PARAMS"]
        bl_params["WAVELENGTH"] = wl
        bl_params["DETECTOR_DISTANCE"] = dd
        bl_params["DETECTOR_RADIUS"] = dr

    @staticmethod
    def follow_start():
        Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] = 0
        Application.OPTIONS["FOLLOW_MODE"]["ENABLED"] = True

    @staticmethod
    def follow_stop():
        Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] = 0
        Application.OPTIONS["FOLLOW_MODE"]["ENABLED"] = False

    @staticmethod
    def follow_enabled():
        return Application.OPTIONS["FOLLOW_MODE"]["ENABLED"]

    @staticmethod
    def follow_inc_frame():
        Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] += 1

    def __init__(self, static_fpath, sio):
        self.read_config()
        self.sio = sio
        self.static_path = static_fpath


def init_app(static_fpath, sio):
    """ Initializes the application instance """
    global APP

    if not APP:
        APP = Application(static_fpath, sio)

    return APP


def get_app():
    """ Returns the application instance """
    return APP
