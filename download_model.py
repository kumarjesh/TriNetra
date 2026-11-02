import os
import urllib.request
import sys

models_dir = r"c:\Users\satis\OneDrive\Desktop\7th Sense\public\models"
os.makedirs(models_dir, exist_ok=True)
dest_path = os.path.join(models_dir, "yolov10n.onnx")

url = "https://github.com/THU-MIG/yolov10/releases/download/v1.1/yolov10n.onnx"
print(f"Downloading YOLOv10n ONNX model to {dest_path}...")

def reporthook(blocknum, blocksize, totalsize):
    readsofar = blocknum * blocksize
    if totalsize > 0:
        percent = readsofar * 1e2 / totalsize
        if blocknum % 100 == 0:
            print(f"Downloaded {readsofar / (1024*1024):.2f} MB / {totalsize / (1024*1024):.2f} MB ({percent:.1f}%)")

urllib.request.urlretrieve(url, dest_path, reporthook=reporthook)
size_mb = os.path.getsize(dest_path) / (1024 * 1024)
print(f"Download complete! File size: {size_mb:.2f} MB")
