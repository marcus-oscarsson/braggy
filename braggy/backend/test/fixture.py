# -*- coding: utf-8 -*-
""" Helper functions for pytest """
import pytest
import os

from braggy.backend import server
from braggy.backend.lib.app import get_app


@pytest.fixture
def client(loop, aiohttp_client):
    """PyTest fixture for REST API"""
    app = server.init_server()
    braggy_app = get_app()

    # Force data path to test data directory
    dpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    braggy_app.CONFIG["DATA_PATH"] = dpath

    return loop.run_until_complete(aiohttp_client(app))
