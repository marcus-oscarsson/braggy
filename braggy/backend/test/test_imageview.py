import os

from braggy.backend.lib.app import get_app


async def test_get_image(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath, "compress": False}

    resp = await client.post("/imageview/get-image", json=params)
    assert resp.status == 200
    assert resp.content_type == 'application/octet-stream'

    # Test again with compression
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath, "compress": True}

    resp = await client.post("/imageview/get-image", json=params)
    assert resp.status == 200
    assert resp.content_type == 'application/octet-stream'


async def test_get_image_header(client):
    """Test root route"""
    bapp = get_app()
    imgpath = os.path.join(bapp.CONFIG["DATA_PATH"], "in16c_010001.cbf")

    params = {"path": imgpath}
    resp = await client.post("/imageview/get-image-header", json=params)

    data = await(resp.json())

    assert resp.status == 200
    assert "Content-Type" in data
