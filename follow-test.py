import urllib.request
import time


if __name__ == "__main__":
    urls = [
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0050.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0051.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0052.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0053.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0054.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0055.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0056.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0057.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0058.cbf",
        "http://localhost:3000/api/imageview/show-image?path=id29%2FFAE_w1_2_0059.cbf",
    ]

    for url in urls:
        time.sleep(0.2)
        contents = urllib.request.urlopen(url).read()
        print("OK: %s" % url)
