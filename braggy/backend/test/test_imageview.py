import os
from urllib.parse import urlencode, quote_plus

from braggy.backend.app import App


def test_get_preload(client):
    """Test root route"""
    bapp = App()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = client.post("/api/imageview/preload", json=params)
    data = (resp.json())

    assert resp.status_code == 200
    assert 'Wavelength' in data['parsed_ext_hdr']
    assert 'wavelength' in data['braggy_hdr']


def test_get_image(client):
    """Test root route"""
    bapp = App()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = client.get("/api/imageview/image?%s" % urlencode(params, quote_via=quote_plus))

    assert resp.status_code == 200
    assert resp.headers.get("content-type") == 'image/png'


def test_get_image_raw_data(client):
    """Test root route"""
    bapp = App()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = client.post("/api/imageview/raw-full", json=params)

    assert resp.status_code == 200
    assert resp.headers.get("content-type") == 'application/octet-stream'


def test_get_image_header(client):
    """Test root route"""
    bapp = App()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = client.post("/api/imageview/hdr", json=params)

    data = resp.json()

    assert resp.status_code == 200
    assert 'Wavelength' in data['parsed_ext_hdr']
    assert 'wavelength' in data['braggy_hdr']
