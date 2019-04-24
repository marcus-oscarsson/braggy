# -*- coding: utf-8 -*-
""" Helper functions for pytest """
import pytest
import os

from starlette.testclient import TestClient

from braggy.backend import server
from braggy.backend.app import App


@pytest.fixture
def client(loop, aiohttp_client):
    """PyTest fixture for REST API"""
    app = server.init_server()
    braggy_app = App()

    # Force data path to test data directory
    dpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    braggy_app.CONFIG["DATA_PATH"] = dpath

    client = TestClient(app)    
    
    return client
