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

    data_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

    expected_resp = [
        {
            'text': 'FAE_w1_4_7199.cbf',
            'fpath': data_root + '/FAE_w1_4_7199.cbf',
            'isLeaf': True
        },
        {
            'text': 'in16c_010001.cbf',
            'fpath': data_root + '/in16c_010001.cbf',
            'isLeaf': True
        },
        {
            'text': 'FAE_w1_4_7186.cbf',
            'fpath': data_root + '/FAE_w1_4_7186.cbf',
            'isLeaf': True
        }
    ]

    assert resp.status == 200
    assert data == expected_resp


async def test_init(client):
    """Test root route"""
    resp = await client.post("/file-browser/init", json={"path": ""})
    data = await(resp.json())

    expected_resp = [
        {
            'text': 'FAE_w1_4_7199.cbf',
            'fpath': '/home/marcus/projects/braggy/braggy/backend/test/data/FAE_w1_4_7199.cbf',
            'isLeaf': True
        },
        {
            'text': 'in16c_010001.cbf',
            'fpath': '/home/marcus/projects/braggy/braggy/backend/test/data/in16c_010001.cbf',
            'isLeaf': True
        },
        {
            'text': 'FAE_w1_4_7186.cbf',
            'fpath': '/home/marcus/projects/braggy/braggy/backend/test/data/FAE_w1_4_7186.cbf',
            'isLeaf': True
        }
    ]

    assert resp.status == 200
    assert data == expected_resp
