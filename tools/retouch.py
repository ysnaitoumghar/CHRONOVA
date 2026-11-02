"""Step 1: remove dial wordmarks from the two usable raw photos (raw files are never modified).
Outputs lossless PNGs in .work/ (ignored by the site)."""
import cv2, numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
import os; RAW='images/raw/'; OUT='.work/'; os.makedirs(OUT, exist_ok=True)

def bgr(p): return cv2.cvtColor(np.array(Image.open(p).convert('RGB')), cv2.COLOR_RGB2BGR)

# --- Jordan (desktop hero): remove LIGE wordmark + winged emblem ---
# The dial has a regular dashed hatch. We find the logo pixels, then fill them by cloning the
# hatch lattice from (-5,-40) px above (measured by autocorrelation), top to bottom, so the pattern continues.
im = bgr(RAW+'pexels-jordanr93-10414975.jpg')
x0,y0,x1,y1 = 2700,1900,3050,2400
g = cv2.cvtColor(im[y0:y1,x0:x1], cv2.COLOR_BGR2GRAY)
m = (g>150).astype(np.uint8)*255
poly = np.zeros_like(m)
cv2.fillPoly(poly,[np.array([[20,20],[290,20],[290,170],[255,300],[255,495],[20,495]])],255)
m = cv2.bitwise_and(m,poly)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8))
n,lab,st,_ = cv2.connectedComponentsWithStats(m)
keep = np.zeros_like(m)
for i in range(1,n):
    if st[i,4]>12: keep[lab==i]=255
keep = cv2.dilate(keep, np.ones((17,17),np.uint8))
roi = im[y0:y1,x0:x1].copy()
out = roi.copy()
DY,DX = 40,5
ys = np.where(keep.any(1))[0]
for y in range(ys.min(), ys.max()+1):
    row = keep[y]>0
    if y-DY<0: continue
    xs = np.where(row)[0]
    sx = np.clip(xs-DX,0,roi.shape[1]-1)
    out[y,xs] = out[y-DY,sx]
soft = cv2.GaussianBlur(keep,(0,0),4).astype(np.float32)[...,None]/255
res = (out*soft + roi*(1-soft)).astype(np.uint8)
im[y0:y1,x0:x1] = res
cv2.imwrite(OUT+'jordan_clean.png', im)

# --- Amir (mobile hero): remove ROMANSON wordmark ---
im = bgr(RAW+'pexels-amirvisuals-6489728.jpg')
ox,oy = 1150,2300
roi = im[oy:oy+350, ox:ox+600]
g = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
bh = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
t = (bh>9).astype(np.uint8)*255
zone = np.zeros_like(t)
cv2.fillPoly(zone,[np.array([[150,130],[285,125],[290,200],[150,200]])],255)   # "RON"
cv2.fillPoly(zone,[np.array([[315,25],[475,25],[475,115],[315,115]])],255)      # "NSON"
t = cv2.bitwise_and(t,zone)
t = cv2.dilate(t, np.ones((9,9),np.uint8))
roi2 = cv2.inpaint(roi, t, 7, cv2.INPAINT_TELEA)
im[oy:oy+350, ox:ox+600] = roi2
cv2.imwrite(OUT+'amir_clean.png', im)
print('ok')
