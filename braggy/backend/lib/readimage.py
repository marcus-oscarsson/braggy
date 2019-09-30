# -*- coding:utf-8 -*-
"Functions for reading image files"

import os
import io
import math
import logging


from abc import (ABC, abstractmethod)

from collections import OrderedDict

import h5py
import numpy as np
from PIL import Image, ImageOps
from fabio.cbfimage import cbfimage

Image.MAX_IMAGE_PIXELS = 1000000000
Image.warnings.simplefilter('ignore', Image.DecompressionBombWarning)

log = logging.getLogger('braggy')


class ImageCache():
    IMAGES = OrderedDict()
    SIZE = 100

    @staticmethod
    def add(path, d):

        if path in ImageCache.IMAGES:
            ImageCache.IMAGES[path].update(d)
        else:
            ImageCache.IMAGES[path] = d

        if len(ImageCache.IMAGES) == ImageCache.SIZE:
            ImageCache.IMAGES.pop(last=False)

    @staticmethod
    def get(path):
        return ImageCache.IMAGES[path]

    @staticmethod
    def incache(path, key=None):
        _in = False

        if key and path in ImageCache.IMAGES and key in ImageCache.IMAGES:
            _in = True
        elif path in ImageCache.IMAGES:
            _in = True

        return _in

class FileReader():
    def __init__(self):
        self._handlers = {}

    def _check_path(self, path):
        _root, ext = os.path.splitext(path)

        if not os.path.exists(path):
            raise IOError("Path %s does not exist" % path)

        if not ext.lower() in self._handlers:
            raise KeyError("No handler for ext %s (%s)" % (ext, path))

        return ext

    def _get_handler(self, ext):
        return self._handlers[ext]

    def register_handler(self, handler):
        for ext in handler._EXT:
            if ext in self._handlers:
                log.warning("Handler for extension %s replaced" % ext)
            else:
                log.info("Registred handler for extension %s" % ext)

            self._handlers[ext] = handler

    def get_data(self, path, variant="raw", **kwargs):
        ext = self._check_path(path)
        handler = self._get_handler(ext)

        try:
            handler_method = getattr(handler, 'get_%s_data' % variant )
        except AttributeError:
            log.exception("No handler for extension %s and variant %s" % (ext, variant))
            raise

        if not ImageCache.incache(path, variant):
            data = handler_method(path, **kwargs)
        else:
            data = ImageCache.get(path)[variant]

        return data

    def get_hdr(self, path):
        ext = self._check_path(path)
        handler = self._get_handler(ext)

        if not ImageCache.incache(path, 'hdr'):
            hdr = handler.get_hdr(path)
        else:
            hdr = ImageCache.get(path)['hdr']

        return hdr

    def preload(self, path):
        ext = self._check_path(path)
        handler = self._get_handler(ext)

        if not ImageCache.incache(path):
            hdr, raw_data, preview_data = handler.preload(path)
            ImageCache.add(path, {
              'hdr': hdr, 
              'raw': raw_data,
              'preview': preview_data
            })
        else:
            hdr = ImageCache.get(path)['hdr']

        return hdr


class AbstractFormatHandler(ABC):
    @abstractmethod
    def preload(self, path):
        pass

    @abstractmethod
    def get_hdr(self, path):
        pass

    @abstractmethod
    def get_raw_data(self, path):
        pass

    @abstractmethod
    def get_preview_data(self, path):
        pass

class HDF5FormatHandler(AbstractFormatHandler):
    _FORMAT = 'hdf5'
    _EXT = ['.h5', 'hdf5']

    def __init__(self):
        pass

    def preload(self, path):
        data = self._h5dump(path)['/entry/data/data'][0]
        img_hdr = {}

        np_array = data.astype(np.float32)
        raw_data = np_array.tobytes()
        preview_data = data.clip(0).astype(np.uint8).tobytes()

        width = data.shape[0]
        height = data.shape[1]

        _max = np_array.max().item()
        _min = np_array.min().item()
        _mean = np_array.mean().item()

        # braggy_hdr = self._parse_header(img_hdr, data)
        braggy_hdr = {
                'wavelength': 1,
                'detector_distance': 1,
                'beam_cx': width,
                'beam_cy': height,
                'beam_ocx': (width / 2),
                'beam_ocy': (height / 2),
                'detector_radius': 0.1,
                'pixel_size_x': 0.001,
                'pixel_size_y': 0.001,
                'img_width': width,
                'img_height': height,
                'pxxpm': 1,
                'pxypm': 1,
                'min': _min,
                'max': _max,
                'mean': _mean,
            }

        img_hdr['braggy_hdr'] = braggy_hdr
        
        return img_hdr, raw_data, preview_data

    def get_hdr(self, path):
        pass

    def get_raw_data(self, path):
        pass

    def get_preview_data(self, path):
        pass

    def _descend_obj(self, obj):
        data = {}

        if type(obj) in [h5py._hl.group.Group, h5py._hl.files.File]:
            for key in obj.keys():
                data.update(self._descend_obj(obj[key]))
        elif type(obj) == h5py._hl.dataset.Dataset:
            for key in obj.attrs.keys():
                data[obj.name + "/" + key] = obj.attrs[key]

            data[obj.name] = obj.attrs
            data[obj.name] =  obj[...]

        return data

    def _h5dump(self, path, group='/'):
        data = {}

        with h5py.File(path, 'r') as f:
            data = self._descend_obj(f[group])

        return data

    def _8bit_raw_repr(self, raw_data):
        data = raw_data.data.clip(0)
        data = data.astype(np.uint8)

        return data.tobytes()

    def _image_based_repr(self, cbf_image, fmt, color_space):
        image = cbf_image.toPIL16().convert(color_space, dither=None)
        image = ImageOps.invert(image)

        byte_stream = io.BytesIO()
        image.save(byte_stream, format=fmt, compress_level=1)

        img_data = byte_stream.getvalue()

        return img_data


class CBFFormatHandler(AbstractFormatHandler):
    _FORMAT = 'cbf'
    _EXT = ['.cbf']

    def __init__(self):
        pass

    def preload(self, path):
        cbf_image = cbfimage(fname=path)
        float_data = cbf_image.data.astype(np.float32)
        raw_data = float_data.tobytes()

        preview_data = self._8bit_raw_repr(cbf_image)

        parsed_ext_hdr, braggy_hdr = self._parse_header(cbf_image, float_data)

        img_hdr = {}
        img_hdr['parsed_ext_hdr'] = parsed_ext_hdr
        img_hdr['braggy_hdr'] = braggy_hdr

        return img_hdr, raw_data, preview_data

    def get_hdr(self, path):
        _root, ext = os.path.splitext(path)
        hdr = None

        if ext.lower() == '.cbf':
            cbf_img = cbfimage(fname=path)
            float_data = cbf_img.data.astype(np.float32)
            hdr = cbf_img.header
            parsed_ext_hdr, braggy_hdr = self._parse_header(hdr, float_data)
            hdr['parsed_ext_hdr'] = parsed_ext_hdr
            hdr['braggy_hdr'] = braggy_hdr

        return hdr

    def get_raw_data(self, path, **kwargs):
        cbf_image = cbfimage(fname=path)
        raw_data = cbf_image.data.astype(np.float32).tobytes()

        return raw_data

    def get_preview_data(self, path):
        cbf_image = cbfimage(fname=path)
        data = self._8bit_raw_repr(cbf_image)

        return data

    def _8bit_raw_repr(self, raw_data):
        data = raw_data.data.clip(0)
        data = data.astype(np.uint8)

        return data.tobytes()

    def _image_based_repr(self, cbf_image, fmt, color_space):
        image = cbf_image.toPIL16().convert(color_space, dither=None)
        image = ImageOps.invert(image)

        byte_stream = io.BytesIO()
        image.save(byte_stream, format=fmt, compress_level=1)

        img_data = byte_stream.getvalue()

        return img_data

    def _parse_header(self, cbf_image, np_array):
        width, height = cbf_image.dim1, cbf_image.dim2
        _max = np_array.max().item()
        _min = np_array.min().item()
        _mean = np_array.mean().item()

        hdr = cbf_image.header
        parsed_ext_hdr = {}
        braggy_hdr = {}

        _ext_hdr = hdr.get("_array_data.header_contents", []).split('\r\n')

        for data in _ext_hdr:
            key_value = data.strip('#').strip().split()

            key = key_value[0].strip(':').strip()
            value = ' '.join(key_value[1:])
            parsed_ext_hdr[key] = value
        try:
            w = float(parsed_ext_hdr.get('Wavelength', '0').strip('A '))
            d = float(parsed_ext_hdr.get('Detector_distance', '0').strip('m '))

            bcx, bcy = parsed_ext_hdr['Beam_xy'].split(',')
            bcx, bcy = float(bcx.strip('pixels() ')), float(bcy.strip('pixels() '))

            px_size_x, px_size_y = parsed_ext_hdr.get('Pixel_size', '0').split('x')
            px_size_x, px_size_y = float(px_size_x.strip(
                'm ')), float(px_size_y.strip('m '))

            dr = math.sqrt((px_size_x * width)**2 +
                        (px_size_y * height)**2) / 2

            braggy_hdr = {
                'wavelength': w,
                'detector_distance': d,
                'beam_cx': bcx,
                'beam_cy': bcy,
                'beam_ocx': (width / 2) - bcx,
                'beam_ocy': (height / 2) - bcx,
                'detector_radius': dr,
                'pixel_size_x': px_size_x,
                'pixel_size_y': px_size_y,
                'img_width': width,
                'img_height': height,
                'pxxpm': 1 / px_size_x,
                'pxypm': 1 / px_size_y,
                'min': _min,
                'max': _max,
                'mean': _mean,
            }
        except (KeyError, IndexError):
            log.info("Could not create Braggy header from CBF header")

        return parsed_ext_hdr, braggy_hdr