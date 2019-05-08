# -*- coding:utf-8 -*-
import os

from starlette.responses import FileResponse
from fastapi import APIRouter
 
from braggy.backend.app import App

router = APIRouter()


@router.get('/')
async def index():
    static_path = App().static_path
    return FileResponse(os.path.join(static_path, 'index.html'))