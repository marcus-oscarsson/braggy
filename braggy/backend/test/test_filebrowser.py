import os

from braggy.backend.lib.app import get_app


async def test_root(client):
    """Test root route"""
    resp = await client.get('/')
    assert resp.status == 200


async def test_list_dir(client):
    """Test root route"""
    resp = await client.post("/file-browser/list-dir", json={"path": ""})
    data = await(resp.json())

    assert resp.status == 200
    assert len(data) == 3


async def test_init(client):
    """Test root route"""
    resp = await client.post("/file-browser/init", json={"path": ""})
    data = await(resp.json())

    assert resp.status == 200
    assert len(data) == 3
