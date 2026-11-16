# S76: compare rendered table silhouette (/tmp/fit.png) with the user's blue mark (Update Review.pdf p1 image 2).
# usage: python3 fit-score.py /tmp/fit.png /tmp/im-001.png   (extract: pdfimages -f 1 -l 1 -png "Update Review.pdf" /tmp/im)
import sys, numpy as np
from PIL import Image
shot, mark = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(mark).convert('RGB')).astype(int)
m = (a[...,2] > 150) & (a[...,2]-a[...,0] > 80) & (a[...,2]-a[...,1] > 40)
H, W = m.shape
fill = np.zeros_like(m)
for y in range(H):
    xs = np.nonzero(m[y])[0]
    if len(xs) > 1: fill[y, xs.min():xs.max()+1] = True
s = np.asarray(Image.open(shot).convert('L').resize((W, H))).astype(int)
t = s > 28
t[:, :int(W*0.36)] = False; t[:int(H*0.1)] = False; t[int(H*0.9):] = False
def box(k):
    ys, xs = np.nonzero(k); return xs.min(), xs.max(), ys.min(), ys.max()
iou = (t & fill).sum() / max(1, (t | fill).sum())
print('mark bbox', box(fill)); print('table bbox', box(t)); print('IoU %.3f' % iou)
for f in (0.1, 0.25, 0.5, 0.75, 0.9):
    y = int(box(fill)[2] + f*(box(fill)[3]-box(fill)[2]))
    xm = np.nonzero(fill[y])[0]; xt = np.nonzero(t[y])[0]
    print(f'row {f}: mark {xm.min() if len(xm) else -1}-{xm.max() if len(xm) else -1}  table {xt.min() if len(xt) else -1}-{xt.max() if len(xt) else -1}')
