# CHRONOVA: Image selection (Phase 1)

`images/raw/` contains **4 images**, not a large set. Under the brief's rules **none of the four can be used as-is**, so no slot can be filled.

## Slot table

| Slot | Chosen | Backup | Why |
|---|---|---|---|
| HERO_DESKTOP | none | none | No landscape steel watch without a visible brand. The closest is `jordanr93` (dark studio, good light), but the dial reads "LIGE". |
| HERO_MOBILE | none | none | The closest is `amirvisuals` (portrait, steel, dark top for text), but the dial carries a brand name. |
| WATCH_1–4 (+ ALT) | none | none | There are only 4 images in total, and they are four different shoots. A consistent set of four products with matching angle and light does not exist. |
| CRAFT | none | none | No movement, gear or watchmaker macro. |
| DETAIL_1 / DETAIL_2 | none | none | No crown, bracelet or crystal macro that is brand-free. |
| NEWSLETTER_BG | none | none | Nothing suitable. |

## Rejected images

| File | Size | Reason |
|---|---|---|
| `pexels-pixabay-364822.jpg` | 4928×3264 | **Brand: Rolex** (dial reads "ROLEX Oyster Perpetual Date, DEEPSEA Sea-Dweller", Rolex crown logo). Also a blue/green dial, a lume-green accent, and a bezel engraved with text. Unusable. |
| `pexels-yousefsammm-16093242.jpg` | 2848×4272 | **Brand: LIGE** on dial. **Rose-gold** indices, hands and crown, a brown leather strap, and warm amber light over the whole frame. Fails the no-warm-tones rule and can't be neutralised. |
| `pexels-jordanr93-10414975.jpg` | 6309×4206 | **Brand: LIGE** (logo and winged emblem on dial, "TACHYMETER" bezel text). Blue accent ring on dial. The watch is centred, so there is no empty space on the left for hero text. Technically strong (sharp, dark, cool light), and it would be the best candidate if the dial were retouched. |
| `pexels-amirvisuals-6489728.jpg` | 3239×5759 | **Brand: partial "ROMANSON/ROBINSON" wordmark** on dial (visible at 12 o'clock). Warm brownish rocks and a slight warm cast. It is a rocky outdoor still life, not a studio set. Resolution is excellent, and it is a plausible mobile hero if the dial text is retouched and the grade is cooled. |

## Decision needed

1. **Provide more images (recommended).** To fill the slots I need roughly 12–15 brand-free steel watch photos on dark or neutral backgrounds, with 4 matching product shots and 2–3 macro and movement shots. Pexels and Unsplash searches such as "watch movement macro", "watchmaker", "steel watch dark studio" and "watch crown macro" work well. Pick unbranded or dial-obscured pieces.
2. **Retouch the two near-misses.** I clean the dial text out of `jordanr93` (desktop hero) and `amirvisuals` (mobile hero) and grade them cool and neutral. This gives two heroes, but still no product cards, craft or detail images.
3. **Placeholders for the rest.** I build the full site with these two heroes and neutral dark generated placeholders for the product, craft and detail slots, wired so that swapping real files later needs no code change.

Tell me which one, or say "go" with option 2 and 3 combined.

---

## Update: second batch (12 `.jfif` files)

**Result: all 12 rejected. Still nothing usable.** Every one is under the ~1200px minimum (maximum 736px wide, versus 1200px+ required), and every one shows a real brand.

| File | Width | Reason |
|---|---|---|
| `A_lange &sohne.jfif` | 736 | Brand A. Lange & Söhne on dial, "BEXSONN.COM" watermark, cream backdrop, rose-gold hands |
| `Classic Silver Casio Watch...jfif` | 736 | Casio on dial and box, cluttered Paris photo background |
| `Elegant Silver & black Rado Watch...jfif` | 736 | Rado on dial, sunlit warm stone, looks AI-generated (garbled dial text) |
| `Silver Watch.jfif` | 736 | "OLER" wordmark on dial, but otherwise the best match for the look: grey, dark, steel. Fails on resolution and the wordmark |
| `téléchargement (1).jfif` | 540 | Vacheron Constantin on dial, beige warm background, watermark, 540px |
| `téléchargement (2).jfif` | 736 | Cartier on dial, leather strap, cream background |
| `téléchargement (3).jfif` | 736 | Cartier, "chrono24.com" watermark, wood background, blue cabochon crown |
| `téléchargement (4).jfif` | 736 | Cartier, red Cartier box, white cloth |
| `téléchargement (5).jfif` | 735 | Cartier ×3, one gold, a hand in frame |
| `téléchargement (6).jfif` | 736 | Cartier, yellow gold case, brown strap, beige background |
| `téléchargement (7).jfif` | 736 | Titan on dial and box, warm stone, plant |
| `téléchargement.jfif` | 736 | Rolex ×2 (one with a pink dial), dim display tray |

**Common problem:** these are Pinterest-size thumbnails. At 736px they would look soft at hero size (the hero needs 2400px) and cannot be upscaled convincingly.

---

## Decision (Phase 1 closed): options 2 + 3

Retouch the two near-misses, placeholder-free crops for everything else (no generated art; every slot is a crop of the two real photos):

| Slot | Source | Treatment |
|---|---|---|
| HERO_DESKTOP | `pexels-jordanr93` | LIGE logo removed (hatch pattern cloned over it), canvas extended on the dark left so the watch sits right and text has room, cool-neutral grade |
| HERO_MOBILE | `pexels-amirvisuals` | "ROMANSON" wordmark inpainted, shifted so the watch is in the upper half and text sits on dark rock, desaturated |
| WATCH_1 Meridian (noir) / ALT | jordanr93 | wide crop / crown-and-bezel macro |
| WATCH_2 Équinoxe (platinum) / ALT | amirvisuals | case + bracelet crop / dial close-up |
| WATCH_3 Orbital (graphite) | jordanr93 | tight dial crop |
| WATCH_4 Solstice (white) | amirvisuals | tighter dial crop |
| CRAFT | amirvisuals | bracelet-link macro (**stand-in**: not a movement) |
| DETAIL_1 / DETAIL_2 | amirvisuals / jordanr93 | dial macro / crown + pushers macro |

**Known limits (need better photography):** only two real watches exist, so the four cards are crops of two products; the craft image is not a movement shot, so its caption text overstates it; the hero uses a different watch on mobile than on desktop.
