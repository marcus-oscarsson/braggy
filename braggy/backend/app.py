""" Application wide functionality and configuration"""

import os
import configparser
import logging
import sys

class App():
    instance = None

    class Application():
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

        """ Encapsulates all application wide data """
        @staticmethod
        def read_config():
            fpath = None

            for path in App.Application.DEFAULT_CONFIG_FPATHS:
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
                    msg = "No path set, using default %s:" % App.Application.CONFIG["DATA_PATH"]
                    logging.info(msg)
                else:
                    App.Application.CONFIG["DATA_PATH"] = data_path

        @staticmethod
        def abs_data_path(path):
            path = os.path.normpath(path)
            return os.path.join(App.Application.CONFIG.get("DATA_PATH"), path)

        @staticmethod
        def follow_set_bl_params(wl, dd, dr):
            bl_params = App.Application.OPTIONS["FOLLOW_MODE"]["BL_PARAMS"]
            bl_params["WAVELENGTH"] = wl
            bl_params["DETECTOR_DISTANCE"] = dd
            bl_params["DETECTOR_RADIUS"] = dr

        @staticmethod
        def follow_start():
            App.Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] = 0
            App.Application.OPTIONS["FOLLOW_MODE"]["ENABLED"] = True

        @staticmethod
        def follow_stop():
            App.Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] = 0
            App.Application.OPTIONS["FOLLOW_MODE"]["ENABLED"] = False

        @staticmethod
        def follow_enabled():
            return App.Application.OPTIONS["FOLLOW_MODE"]["ENABLED"]

        @staticmethod
        def follow_inc_frame():
            App.Application.OPTIONS["FOLLOW_MODE"]["FRAME_COUNT"] += 1

        def __init__(self, static_fpath, sio):
            self.read_config()
            self.sio = sio
            self.static_path = static_fpath

    def __new__(cls, *args, **kwargs):
        if not App.instance:
            try:
                App.instance = App.Application(*args, **kwargs)
            except TypeError:
                msg = "Call to init_app missing, must be called to initialize app"
                logging.error(msg)
                sys.exit(-1)

        return App.instance

    def __getattr__(self, name):
        return getattr(self.instance, name)

    def __setattr__(self, name, value):
        return setattr(self.instance, name, value)

    @staticmethod
    def init_app(static_fpath, sio):
        """ Initializes the application instance """
        App(static_fpath, sio)
