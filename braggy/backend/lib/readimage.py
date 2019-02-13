# -*- coding:utf-8 -*-
"Functions for reading image files"

import os
import io

from collections import OrderedDict
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

    def incache(path):
        return path in ImageCache.IMAGES


def get_image_data(path, fmt="bmp", color_space="L"):
    _root, ext = os.path.splitext(path)
    img_data = bytes()

    if ext.lower() == '.cbf':
        if not ImageCache.incache(path):
            img_hdr, raw_data, img_data = _get_image_data(path, fmt, color_space)
            ImageCache.add(path, img_hdr, raw_data, img_data)

        img_hdr, raw_data, img_data = ImageCache.get(path)

    return img_hdr, raw_data, img_data


def _get_image_data(path, fmt, color_space):
    cbf_image = cbfimage(fname=path)
    image = cbf_image.toPIL16().convert(color_space)
    image = ImageOps.invert(image)

    byte_stream = io.BytesIO()
    image.save(byte_stream, format=fmt)

    raw_data = cbf_image.data.tobytes()
    img_data = byte_stream.getvalue()
    img_hdr = cbf_image.header
    img_hdr['parsed_ext_hdr'] = {}

    _ext_hdr = img_hdr.get("_array_data.header_contents", []).split('\r\n')

    for data in _ext_hdr:
        key_value = data.strip('#').strip().split()

        key = key_value[0].strip(':').strip()
        value = ' '.join(key_value[1:])
        img_hdr['parsed_ext_hdr'][key] = value

    return img_hdr, raw_data, img_data


def get_image_hdr(path):
    _root, ext = os.path.splitext(path)
    header = None

    if ext.lower() == '.cbf':
        cbf_image = cbfimage(fname=path)
        header = cbf_image.header

    return header
