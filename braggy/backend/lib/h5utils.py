# -*- coding:utf-8 -*-
import h5py


def _descend_obj(obj):
    data = {}

    if type(obj) in [h5py._hl.group.Group, h5py._hl.files.File]:
        for key in obj.keys():
            data.update(_descend_obj(obj[key]))
    elif type(obj) == h5py._hl.dataset.Dataset:
        for key in obj.attrs.keys():
            data[obj.name + "/" + key] = obj.attrs[key]

        data[obj.name] = obj.attrs
        data[obj.name] =  obj[...]

    return data


def h5dump(path, group='/'):
    data = {}

    with h5py.File(path, 'r') as f:
        data = _descend_obj(f[group])

    return data


