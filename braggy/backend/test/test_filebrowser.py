import os

def test_root(client):
    """Test root route"""
    resp = client.get('/')
    assert resp.status_code == 200


def test_list_dir(client):
    """Test root route"""
    resp = client.post("/api/file-browser/list-dir", json={"path": ""})

    data = resp.json()

    assert resp.status_code == 200
    assert len(data.get("items", [])) == 3


def test_init(client):
    """Test root route"""
    resp = client.get("/api/file-browser/init")
    data = resp.json()

    assert resp.status_code == 200
    assert len(data.get("items", [])) == 3
