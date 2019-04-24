import uvicorn
from braggy.backend import server

if __name__ == '__main__':
    app = server.init_server()
    uvicorn.run(app, host='0.0.0.0', port=8080)