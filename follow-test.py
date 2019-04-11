import time
import json

from urllib import request


if __name__ == "__main__":
    urls = [
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0052.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0050.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0051.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0053.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0054.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0055.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0056.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0057.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0058.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0059.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_1_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_2_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_2_1_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_2_2_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_3_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_4_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_5_0001.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_1_0002.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_2_0002.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2Fref-FAE_2_1_0002.cbf",        
    ]

    data = json.dumps({"wavelength": 0, "detector_distance": 0}).encode()

    req = request.Request("http://localhost:3000/api/imageview/start-follow", data=data)
    request.urlopen(req).read()

    for url in urls:
        time.sleep(0.1)
        content = json.loads(request.urlopen(url).read()).get('msg')
        print("%s: %s" % (content, url))

    req = request.Request("http://localhost:3000/api/imageview/stop-follow", data={})
    request.urlopen(req).read()
