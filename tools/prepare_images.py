"""Step 2: grade, crop and export responsive images to images/.
Run:  python tools/retouch.py && python tools/prepare_images.py
Edit CROPS to point a slot at a different region (coords are in the retouched source, full resolution)."""
import cv2, numpy as np, os, json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
OUT = 'images/'; os.makedirs(OUT, exist_ok=True)

def load(p): return cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)

def grade(rgb):
    """Fully desaturate to a cool neutral steel look; deep blacks, slightly lifted contrast."""
    f = rgb.astype(np.float32)/255
    lum = f @ np.array([0.2126,0.7152,0.0722],np.float32)
    lum = np.clip((lum-0.015)/0.985, 0, 1)                    # deep blacks
    lum = lum**1.04
    lum = lum + 0.22*(lum-0.5)*(1-np.abs(2*lum-1))*2          # gentle S-curve
    lum = np.clip(lum,0,1)
    out = np.stack([lum*0.985, lum*0.995, lum*1.0+0.004*(1-lum)], -1)   # tiny cool tint, no warm
    return (np.clip(out,0,1)*255).astype(np.uint8)

# ---- hero desktop: pad the dark sides/top (reflect + blur + darken) so the watch is smaller and sits right ----
def soft_pad(img, top=0, left=0, bottom=0):
    h,w = img.shape[:2]
    p = cv2.copyMakeBorder(img, top,bottom,0,0, cv2.BORDER_REFLECT)
    if left:   # smooth, vertically-blurred average of the left edge (no streaks, no mirrored watch)
        edge = p[:, :300].astype(np.float32).mean(axis=1)                  # (H,3)
        edge = cv2.GaussianBlur(edge.reshape(-1,1,3),(0,0),sigmaX=0.1,sigmaY=160).reshape(-1,3)
        p = np.concatenate([np.repeat(edge[:,None,:],left,axis=1).astype(np.uint8), p], axis=1)
    blur = cv2.GaussianBlur(p,(0,0),90)
    H,W = p.shape[:2]
    a = np.ones((H,W),np.float32)                      # 1 = original/mirror detail, 0 = blurred dark
    if left:   a[:, :left]  = np.linspace(0,1,left)[None,:]
    if top:    a[:top,:]    = np.minimum(a[:top,:], np.linspace(0,1,top)[:,None])
    if bottom: a[H-bottom:,:] = np.minimum(a[H-bottom:,:], np.linspace(1,0,bottom)[:,None])
    dark = np.ones((H,W),np.float32)
    if left:   dark[:, :left] = (np.linspace(0.0,1,left)[None,:])**1.6*0.95+0.05
    if bottom: dark[H-bottom:,:] = np.linspace(1,0.5,bottom)[:,None]
    out = p*a[...,None] + blur*(1-a[...,None])
    return np.clip(out*dark[...,None],0,255).astype(np.uint8)

j = load('.work/jordan_clean.png')
pad = soft_pad(j, top=500, left=2300)
ch = 4650; cw = int(round(ch*16/9)); cx0 = 2300+3290-int(cw*0.66)
hero_d = pad[0:ch, cx0:cx0+cw]
amir = load('.work/amir_clean.png')
hero_m = soft_pad(amir[900:,:], bottom=899)[:5758,:3239]

# slot -> (source image, (x0,y0,x1,y1), aspect(w,h), max widths)
J, A = j, amir
CROPS = {
 'hero-desktop': (hero_d, None, (16,9), [640,1080,1600,2400]),
 'hero-mobile' : (hero_m, None, (9,16), [640,1080,1600]),
 'watch-1'     : (J, (1640,40,4940,4165), (4,5), [640,1080,1600]),
 'watch-1-alt' : (J, (2000,300,4000,2800), (4,5), [640,1080,1600]),
 'watch-2'     : (A, (500,1500,2900,4500), (4,5), [640,1080,1600]),
 'watch-2-alt' : (A, (693,1450,2393,3575), (4,5), [640,1080,1600]),
 'watch-3'     : (J, (2190,875,4390,3625), (4,5), [640,1080,1600]),
 'watch-4'     : (A, (743,1500,2343,3500), (4,5), [640,1080,1600]),
 'craft'       : (A, (1560,3200,3170,5212), (4,5), [640,1080,1600]),
 'detail-1'    : (A, (850,1950,1950,3050), (1,1), [640,1080]),
 'detail-2'    : (J, (1983,541,3965,2523), (1,1), [640,1080,1600]),
}
manifest = {}
for name,(src,box,asp,widths) in CROPS.items():
    c = src if box is None else src[box[1]:box[3], box[0]:box[2]]
    h,w = c.shape[:2]
    # enforce exact aspect by centre trim
    tw,th = asp
    if w/h > tw/th:  nw=int(h*tw/th); c=c[:, (w-nw)//2:(w-nw)//2+nw]
    else:            nh=int(w*th/tw); c=c[(h-nh)//2:(h-nh)//2+nh, :]
    c = grade(c)
    im = Image.fromarray(c); sizes=[]
    for tw_ in widths:
        if tw_ > im.width: continue
        r = im.resize((tw_, round(tw_*asp[1]/asp[0])), Image.LANCZOS)
        r.save(f'{OUT}{name}-{tw_}.webp','WEBP',quality=80,method=6)
        sizes.append((tw_, r.height))
    top = max(s[0] for s in sizes)
    jw = min(1600, top); r = im.resize((jw, round(jw*asp[1]/asp[0])), Image.LANCZOS)
    r.save(f'{OUT}{name}.jpg','JPEG',quality=82,optimize=True,progressive=True)
    manifest[name]={'sizes':sizes,'jpg':[jw,r.height]}
    print(name, sizes)
json.dump(manifest, open(OUT+'manifest.json','w'), indent=1)
