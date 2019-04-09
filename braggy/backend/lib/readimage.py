# -*- coding:utf-8 -*-
"Functions for reading image files"

import os
import io
import math
import logging
from collections import OrderedDict

import numpy as np
from PIL import Image, ImageOps
from fabio.cbfimage import cbfimage

Image.MAX_IMAGE_PIXELS = 1000000000

Image.warnings.simplefilter('ignore', Image.DecompressionBombWarning)


class ImageCache():
    IMAGES = OrderedDict()
    SIZE = 100

    @staticmethod
    def add(path, img_hdr, raw_data, img_data):
        ImageCache.IMAGES[path] = (img_hdr, raw_data, img_data)

        if len(ImageCache.IMAGES) == ImageCache.SIZE:
            ImageCache.IMAGES.pop(last=False)

    @staticmethod
    def get(path):
        return ImageCache.IMAGES[path]

    @staticmethod
    def incache(path):
        return path in ImageCache.IMAGES


def get_image_data(path, fmt="png", color_space="L"):
    _root, ext = os.path.splitext(path)
    img_data = bytes()

    if not os.path.exists(path):
        raise IOError("Path %s does not exist" % path)

    if ext.lower() == '.cbf':
        if not ImageCache.incache(path):
            img_hdr, raw_data, img_data = _get_image_data(path, fmt, color_space)
            ImageCache.add(path, img_hdr, raw_data, img_data)

        img_hdr, raw_data, img_data = ImageCache.get(path)

    return img_hdr, raw_data, img_data


def _get_image_data(path, fmt, color_space):
    cbf_image = cbfimage(fname=path)
    raw_data = cbf_image.data.tobytes()
    img_hdr = cbf_image.header

    if fmt != "raw":
        img_data = _image_based_repr(cbf_image, fmt, color_space)
    else:
        img_data = _8bit_raw_repr(cbf_image, color_space)

    parsed_ext_hdr, braggy_hdr = _parse_header(img_hdr, cbf_image.dim1, cbf_image.dim2)

    img_hdr['parsed_ext_hdr'] = parsed_ext_hdr
    img_hdr['braggy_hdr'] = braggy_hdr

    return img_hdr, raw_data, img_data


def _8bit_raw_repr(raw_data, color_space):
    data = raw_data.data.clip(0)
    data = data.astype(np.uint8)

    return data.tobytes()


def _image_based_repr(cbf_image, fmt, color_space):
    image = cbf_image.toPIL16().convert(color_space, dither=None)
    image = ImageOps.invert(image)

    byte_stream = io.BytesIO()
    image.save(byte_stream, format=fmt, compress_level=1)

    img_data = byte_stream.getvalue()

    return img_data


def _parse_header(hdr, width, height):
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
            'pxypm': 1 / px_size_y
        }
    except (KeyError, IndexError):
        logging.info("Could not create Braggy header from CBF header")

    return parsed_ext_hdr, braggy_hdr


def get_image_hdr(path):
    _root, ext = os.path.splitext(path)
    hdr = None

    if ext.lower() == '.cbf':
        cbf_img = cbfimage(fname=path)
        hdr = cbf_img.header
        parsed_ext_hdr, braggy_hdr = _parse_header(hdr, cbf_img.dim1, cbf_img.dim2)
        hdr['parsed_ext_hdr'] = parsed_ext_hdr
        hdr['braggy_hdr'] = braggy_hdr

    return hdr
