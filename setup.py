#!/usr/bin/env python
# -*- coding: utf-8 -*-
import io
import re

from setuptools import setup, find_packages

with io.open('README.md', 'rt', encoding='utf8') as f:
    readme = f.read()

with io.open('braggy/__init__.py', 'rt', encoding='utf8') as f:
    version = re.search(r'__version__ = \"(.*?)\"', f.read()).group(1)

setup(
    name='BSX3',
    version=version,
    url='https://www.palletsprojects.com/p/flask/',
    license='GPL',
    author='Marcus Oskarsson',
    author_email='oscarsso@esrf.fr',
    maintainer='Marcus Oskarsson',
    maintainer_email='oscarsso@esrf.fr',
    description='Braggy diffraction image viewer',
    long_description=readme,
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    platforms='Linux',
    python_requires='>=2.7,!=3.0.*,!=3.1.*,!=3.2.*,!=3.3.*,!=3.4.',
    install_requires=[
        'gevent',
        'flask',
        'python-socketio',
        'python-engineio',
        'flask-socketio',
        'gevent-websocket',
    ],
    extras_require={
        'dev': [
            'pytest>=3',
            'pytest-cov',
            'coverage',
            'sphinx',
        ],
        'docs': [
            'sphinx',
        ]
    },
    classifiers=[
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    scripts=['bin/braggy-backend.py']
)
