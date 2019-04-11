import os

from braggy.backend.lib.app import get_app


async def test_get_preload(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = await client.post("/api/imageview/preload", json=params)

    data = await(resp.json())

    assert resp.status == 200
    assert 'Wavelength' in data['parsed_ext_hdr']
    assert 'wavelength' in data['braggy_hdr']


async def test_get_image(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}

    resp = await client.get("/api/imageview/image", params=params)
    assert resp.status == 200
    assert resp.content_type == 'image/png'


async def test_get_image_raw_data(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = await client.post("/api/imageview/raw-full", json=params)

    data = await(resp.read())

    assert resp.status == 200
    assert resp.content_type == 'application/octet-stream'


async def test_get_image_header(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = await client.post("/api/imageview/hdr", json=params)

    data = await(resp.json())

    assert resp.status == 200
    assert 'Wavelength' in data['parsed_ext_hdr']
    assert 'wavelength' in data['braggy_hdr']
