#!/usr/bin/env python3
"""Builds server/src/data/lgdGeo.json — approximate centre points for every LGD district and
sub-district, plus the seeded cities in server/src/data/indiaCities.js. Used for "detect my
city" (find the nearest place to the user's GPS position).

The LGD village list has no coordinates, so they are derived from two open datasets:
  * District boundaries (Census 2011) — DataMeet, CC BY 2.5 India
      https://github.com/datameet/maps/tree/master/Districts/Census_2011  (2011_Dist.shp/.dbf/.shx)
  * PIN code places with lat/long (from GeoNames) — DataMeet, CC BY 3.0
      https://github.com/datameet/pincode  (data/IN.csv)

District centre = centroid of its Census 2011 boundary (matched by name, including official
renames). Districts created after 2011 and every sub-district use the median of the PIN code
places whose names match that sub-district or one of its villages — kept only if the point lies
inside the expected 2011 district. Anything still unknown inherits its district centre and is
flagged approximate. Good enough to pick the nearest city; not street-level accuracy.

Usage (needs `pip install pyshp`):
  python3 server/scripts/build_lgd_geo.py <lgd.csv> <path/to/2011_Dist> <pincode IN.csv> server/src/data/lgdGeo.json
"""
import csv, json, re, sys, statistics, difflib
from collections import defaultdict
from pathlib import Path
import shapefile  # pyshp

lgd_csv, dist_shp, pin_csv, out_path = sys.argv[1:5]
CITIES_JS = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'indiaCities.js'


def norm(s):
    s = s.lower().replace('&', ' and ')
    s = re.sub(r'\(.*?\)', ' ', s)
    s = re.sub(r'^the\s+', '', s.strip())
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def squash(s):
    # spelling-tolerant key: drop vowels/doubles so Ahmadabad≈Ahmedabad, Darjeeling≈Darjiling
    s = norm(s).replace(' ', '')
    s = re.sub(r'(.)\1+', r'\1', s)
    return s[0] + re.sub(r'[aeiouyh]', '', s[1:]) if s else s


# Old / alternate state names used by the 2011 and GeoNames datasets.
STATE_ALIASES = {
    'telangana': ['andhra pradesh'],
    'ladakh': ['jammu and kashmir'],
    'dadra and nagar haveli and daman and diu': ['dadra and nagar haveli', 'dadar and nagar haveli', 'dadara and nagar havelli', 'daman and diu'],
    'arunachal pradesh': ['arunanchal pradesh'],
    'odisha': ['orissa', 'orisa'],
    'uttarakhand': ['uttaranchal'],
    'chhattisgarh': ['chattisgarh'],
    'puducherry': ['pondicherry'],
    'delhi': ['nct of delhi', 'new delhi'],
    'andaman and nicobar islands': ['andaman and nicobar', 'andaman and nicobar island'],
}

# Same territory, new official name (LGD / app name -> 2011 boundary name).
RENAMED = {
    'ananthapuramu': 'anantapur', 'y s r kadapa': 'y s r', 'kamrup metro': 'kamrup metropolitan',
    'sribhumi': 'karimganj', 'gurugram': 'gurgaon', 'nuh': 'mewat', 'east singhbum': 'purbi singhbhum',
    'west singhbhum': 'pashchimi singhbhum', 'belagavi': 'belgaum', 'bengaluru urban': 'bangalore',
    'bengaluru south': 'ramanagara', 'kalaburagi': 'gulbarga', 'shivamogga': 'shimoga', 'vijayapura': 'bijapur',
    'lakshadweep district': 'lakshadweep', 'khandwa': 'east nimar', 'khargone': 'west nimar',
    'narmadapuram': 'hoshangabad', 'ahilyanagar': 'ahmadnagar', 'chhatrapati sambhajinagar': 'aurangabad',
    'dharashiv': 'osmanabad', 'gadchiroli': 'garhchiroli', 'raigad': 'raigarh', 'balasore': 'baleshwar',
    'keonjhar': 'kendujhar', 's a s nagar': 'sahibzada ajit singh nagar', 'sri muktsar sahib': 'muktsar',
    'prayagraj': 'allahabad', 'ayodhya': 'faizabad', 'hathras': 'mahamaya nagar', 'amroha': 'jyotiba phule nagar',
    'kasganj': 'kansiram nagar', 'bhadohi': 'sant ravi das nagar', 'pauri garhwal': 'garhwal',
    'cooch behar': 'koch bihar', 'howrah': 'haora', 'deogarh': 'debagarh', 'sonepur': 'subarnapur',
    'gangtok': 'east', 'mangan': 'north', 'namchi': 'south', 'gyalshing': 'west', 'old delhi': 'central',
    # common city spellings used in the seeded city list
    'bengaluru': 'bangalore', 'mysuru': 'mysore', 'mangaluru': 'dakshina kannada', 'hubballi': 'dharwad',
    'belgaum': 'belgaum', 'gurgaon': 'gurgaon', 'kolkata': 'kolkata', 'mumbai': 'mumbai',
}

# Districts created after 2011: the district they were split from (LGD name -> 2011 name).
CARVED_FROM = {
    'alluri sitharama raju': 'visakhapatnam', 'anakapalli': 'visakhapatnam', 'annamayya': 'y s r',
    'bapatla': 'guntur', 'dr b r ambedkar konaseema': 'east godavari', 'eluru': 'west godavari',
    'kakinada': 'east godavari', 'markapuram': 'prakasam', 'nandyal': 'kurnool', 'ntr': 'krishna',
    'palnadu': 'guntur', 'parvathipuram manyam': 'vizianagaram', 'polavaram': 'west godavari',
    'sri sathya sai': 'anantapur', 'tirupati': 'chittoor',
    'bichom': 'west kameng', 'kamle': 'lower subansiri', 'keyi panyor': 'lower subansiri',
    'kra daadi': 'kurung kumey', 'leparada': 'west siang', 'lower siang': 'west siang',
    'pakke kessang': 'east kameng', 'shi yomi': 'west siang', 'siang': 'west siang',
    'bajali': 'barpeta', 'biswanath': 'sonitpur', 'charaideo': 'sivasagar', 'hojai': 'nagaon',
    'majuli': 'jorhat', 'south salmara mancachar': 'dhubri', 'tamulpur': 'baksa', 'west karbi anglong': 'karbi anglong',
    'gaurela pendra marwahi': 'bilaspur', 'mungeli': 'bilaspur', 'sakti': 'janjgir champa',
    'charkhi dadri': 'bhiwani', 'hansi': 'hisar',
    'agar malwa': 'shajapur', 'maihar': 'satna', 'mauganj': 'rewa', 'niwari': 'tikamgarh', 'pandhurna': 'chhindwara',
    'palghar': 'thane', 'kakching': 'thoubal', 'kamjong': 'ukhrul',
    'eastern west khasi hills': 'west khasi hills', 'south west khasi hills': 'west khasi hills',
    'east jaintia hills': 'jaintia hills', 'west jaintia hills': 'jaintia hills',
    'meluri': 'phek', 'niuland': 'dimapur', 'noklak': 'tuensang', 'shamator': 'tuensang',
    'fazilka': 'firozpur', 'malerkotla': 'sangrur', 'pathankot': 'gurdaspur',
    'mayiladuthurai': 'nagapattinam', 'jayashankar bhupalapally': 'warangal', 'kumuram bheem asifabad': 'adilabad',
    'amethi': 'sultanpur', 'hapur': 'ghaziabad', 'sambhal': 'moradabad', 'shamli': 'muzaffarnagar',
    'purba bardhaman': 'barddhaman', 'paschim bardhaman': 'barddhaman', 'alipurduar': 'jalpaiguri',
    'jhargram': 'paschim medinipur', 'kalimpong': 'darjiling',
    'balrampur ramanujganj': 'surguja', 'mohla manpur ambagarh chouki': 'rajnandgaon', 'sarangarh bilaigarh': 'raigarh',
    'outer north': 'north west', 'botad': 'bhavnagar', 'beawar': 'ajmer', 'kallakurichi': 'viluppuram',
    'hanumakonda': 'warangal', 'jagitial': 'karimnagar', 'jangoan': 'warangal', 'medchal malkajgiri': 'rangareddy',
    'mulugu': 'warangal', 'narayanpet': 'mahbubnagar', 'rajanna sircilla': 'karimnagar', 'suryapet': 'nalgonda',
}

# Seeded cities whose name isn't a district: the (2011) district they sit in.
CITY_DISTRICT = {
    'nellore': 'sri potti sriramulu nellore', 'rajahmundry': 'east godavari', 'bhilai': 'durg',
    'jamshedpur': 'purbi singhbhum', 'hubli dharwad': 'dharwad', 'navi mumbai': 'thane', 'sangli miraj': 'sangli',
    'noida': 'gautam buddha nagar', 'greater noida': 'gautam buddha nagar', 'asansol': 'barddhaman',
    'durgapur': 'barddhaman', 'siliguri': 'darjiling', 'amaravati': 'guntur', 'machilipatnam': 'krishna',
    'ongole': 'prakasam', 'proddatur': 'y s r', 'naharlagun': 'papum pare', 'bihar sharif': 'nalanda',
    'chirmiri': 'koriya', 'silvassa': 'dadra and nagar haveli', 'mapusa': 'north goa', 'margao': 'south goa',
    'vasco da gama': 'south goa', 'morbi': 'rajkot', 'veraval': 'junagadh', 'dharamshala': 'kangra',
    'phusro': 'bokaro', 'gadag betageri': 'gadag', 'hosapete': 'bellary', 'ranebennur': 'haveri',
    'robertson pet': 'kolar', 'attingal': 'thiruvananthapuram', 'kayamkulam': 'alappuzha', 'manjeri': 'malappuram',
    'murwara': 'katni', 'imphal': 'imphal west', 'shillong': 'east khasi hills', 'tura': 'west garo hills',
    'paradip': 'jagatsinghapur', 'mohali': 'sahibzada ajit singh nagar', 'zirakpur': 'sahibzada ajit singh nagar',
    'beawar': 'ajmer', 'gangapur city': 'sawai madhopur', 'sri ganganagar': 'ganganagar', 'ambur': 'vellore',
    'vaniyambadi': 'vellore', 'nagercoil': 'kanniyakumari', 'jagtial': 'karimnagar', 'kamareddy': 'nizamabad',
    'mancherial': 'adilabad', 'siddipet': 'medak', 'suryapet': 'nalgonda', 'agartala': 'west tripura',
    'udaipur': 'south tripura', 'kotdwar': 'garhwal', 'baharampur': 'murshidabad',
    'barasat': 'north 24 parganas', 'basirhat': 'north 24 parganas', 'habra': 'north 24 parganas',
    'contai': 'purba medinipur', 'kharagpur': 'paschim medinipur', 'medinipur': 'paschim medinipur',
    'krishnanagar': 'nadia', 'ranaghat': 'nadia',
}


def state_keys(state):
    n = norm(state)
    return {n, *STATE_ALIASES.get(n, [])}


# ---------- LGD hierarchy ----------
districts, subdistricts = {}, {}
villages_by_state = defaultdict(lambda: defaultdict(list))   # state -> village name -> [sub-district codes]
sub_by_state = defaultdict(lambda: defaultdict(list))        # state -> sub-district name -> [codes]
subs_of = defaultdict(list)
with open(lgd_csv, encoding='utf-8') as f:
    for r in csv.DictReader(f):
        dc, sdc = r['district_code'], r['sub-district_code']
        districts.setdefault(dc, {'name': r['district_name'], 'state': r['state_name']})
        if sdc not in subdistricts:
            subdistricts[sdc] = {'name': r['sub-district_name'], 'district': dc, 'state': r['state_name']}
            sub_by_state[r['state_name']][norm(r['sub-district_name'])].append(sdc)
            subs_of[dc].append(sdc)
        villages_by_state[r['state_name']][norm(r['village_name'])].append(sdc)


# ---------- Census 2011 district polygons ----------
def ring_centroid(points):
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(points, points[1:] + points[:1]):
        c = x0 * y1 - x1 * y0
        a += c
        cx += (x0 + x1) * c
        cy += (y0 + y1) * c
    return a / 2, cx, cy


polys = []  # (state, name, squashed name, rings, (lat, lon) centroid, bbox)
for sr in shapefile.Reader(dist_shp).iterShapeRecords():
    shp, rec = sr.shape, sr.record.as_dict()
    parts = list(shp.parts) + [len(shp.points)]
    rings = [shp.points[parts[i]:parts[i + 1]] for i in range(len(parts) - 1)]
    A = CX = CY = 0.0
    for ring in rings:
        a, cx, cy = ring_centroid(ring)
        A, CX, CY = A + a, CX + cx, CY + cy
    lon, lat = (CX / (6 * A), CY / (6 * A)) if A else shp.points[0]
    polys.append((norm(rec['ST_NM']), norm(rec['DISTRICT']), squash(rec['DISTRICT']), rings, (lat, lon), shp.bbox))


def inside(lat, lon, poly):
    rings, bbox = poly[3], poly[5]
    if not (bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]):
        return False
    hit = False
    for ring in rings:
        for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
            if (y0 > lat) != (y1 > lat) and lon < (x1 - x0) * (lat - y0) / (y1 - y0) + x0:
                hit = not hit
    return hit


def find_polygon(name, state, fuzzy=True):
    cands = [p for p in polys if p[0] in state_keys(state)]
    n = RENAMED.get(norm(name), norm(name))
    for p in cands:
        if p[1] == n:
            return p
    sq = squash(n)
    for p in cands:
        if p[2] == sq:
            return p
    if fuzzy:
        best = max(cands, key=lambda p: difflib.SequenceMatcher(None, p[1], n).ratio(), default=None)
        if best and difflib.SequenceMatcher(None, best[1], n).ratio() >= 0.86:
            return best
    return None


def state_polygons(state):
    return [p for p in polys if p[0] in state_keys(state)]


dist_poly = {dc: (None if norm(d['name']) in CARVED_FROM else find_polygon(d['name'], d['state'])) for dc, d in districts.items()}
# Polygon used to validate a district's points: its own, else the one it was carved from.
check_poly = {
    dc: dist_poly[dc] or (find_polygon(CARVED_FROM[norm(d['name'])], d['state'], fuzzy=False) if norm(d['name']) in CARVED_FROM else None)
    for dc, d in districts.items()
}

# ---------- PIN code places ----------  (check_poly gaps are filled by voting further down)
pin_rows = []
with open(pin_csv, encoding='utf-8', errors='replace') as f:
    for r in csv.DictReader(f):
        try:
            lat, lon = float(r['latitude']), float(r['longitude'])
        except ValueError:
            continue
        if 6 <= lat <= 37.6 and 68 <= lon <= 97.5:
            pin_rows.append((norm(r['admin_name1']), norm(r['place_name']), lat, lon))

lgd_states_by_key = defaultdict(list)
for st in sub_by_state:
    for k in state_keys(st):
        lgd_states_by_key[k].append(st)

# PIN place -> LGD sub-district, by sub-district name or a village name unique in the state.
raw_points = defaultdict(list)
for pst, pname, lat, lon in pin_rows:
    if not pname:
        continue
    for st in lgd_states_by_key.get(pst, []):
        cands = sub_by_state[st].get(pname, []) or (
            villages_by_state[st].get(pname, []) if len(villages_by_state[st].get(pname, [])) == 1 else []
        )
        for sdc in set(cands):
            raw_points[sdc].append((lat, lon))

# New districts not in CARVED_FROM: their candidate points vote for the 2011 boundary they fall
# in (clear majority required), and that boundary is used to validate them.
for dc, d in districts.items():
    if check_poly[dc] is not None:
        continue
    sp = state_polygons(d['state'])
    votes = defaultdict(int)
    for sdc in subs_of[dc]:
        for lat, lon in raw_points.get(sdc, []):
            for i, p in enumerate(sp):
                if inside(lat, lon, p):
                    votes[i] += 1
                    break
    if votes:
        best = max(votes, key=votes.get)
        if votes[best] * 2 > sum(votes.values()):
            check_poly[dc] = sp[best]

# Keep only points inside the expected district (rejects same-name places elsewhere in the state).
sub_points = {}
for sdc, pts in raw_points.items():
    poly = check_poly.get(subdistricts[sdc]['district'])
    kept = [pt for pt in pts if poly is not None and inside(pt[0], pt[1], poly)]
    if kept:
        sub_points[sdc] = kept


def median_point(pts):
    return (statistics.median(p[0] for p in pts), statistics.median(p[1] for p in pts))


def pin_place(name, state, poly=None):
    """Median of PIN places with exactly this name in the state (inside `poly` if given)."""
    keys, n = state_keys(state), norm(name)
    sp = [poly] if poly else state_polygons(state)
    pts = [(lat, lon) for pst, pname, lat, lon in pin_rows if pst in keys and pname == n and any(inside(lat, lon, p) for p in sp)]
    return median_point(pts) if pts else None


# ---------- District + sub-district centres ----------
dist_xy, approx_districts = {}, set()
for dc, d in districts.items():
    if dist_poly[dc]:
        dist_xy[dc] = dist_poly[dc][4]
        continue
    pts = [p for sdc in subs_of[dc] for p in sub_points.get(sdc, [])]
    hq = pin_place(d['name'], d['state'], check_poly[dc])
    if pts:
        dist_xy[dc] = median_point(pts)
    elif hq:
        dist_xy[dc] = hq
    elif check_poly[dc]:
        dist_xy[dc] = check_poly[dc][4]
        approx_districts.add(dc)

out = {
    'attribution': 'Derived from DataMeet Census 2011 district boundaries (CC BY 2.5 IN) and DataMeet/GeoNames PIN code places (CC BY 3.0).',
    'districts': {}, 'subdistricts': {}, 'cities': {},
}
for dc in districts:
    if dc in dist_xy:
        lat, lon = dist_xy[dc]
        out['districts'][dc] = [round(lat, 4), round(lon, 4)] + ([1] if dc in approx_districts else [])
exact = approx = missing = 0
for sdc, s in subdistricts.items():
    if sub_points.get(sdc):
        lat, lon = median_point(sub_points[sdc])
        out['subdistricts'][sdc] = [round(lat, 4), round(lon, 4)]
        exact += 1
    elif s['district'] in dist_xy:
        lat, lon = dist_xy[s['district']]
        out['subdistricts'][sdc] = [round(lat, 4), round(lon, 4), 1]   # trailing 1 = approximate
        approx += 1
    else:
        missing += 1

# ---------- Seeded cities ----------
city_rows = re.findall(r"name:\s*'((?:[^'\\]|\\.)*)',\s*state:\s*'((?:[^'\\]|\\.)*)'", CITIES_JS.read_text())
lgd_dist_by_name = defaultdict(list)
for dc, d in districts.items():
    lgd_dist_by_name[(norm(d['state']), norm(d['name']))].append(dc)
city_src = defaultdict(int)
for name, state in city_rows:
    name, state = name.replace("\\'", "'"), state.replace("\\'", "'")
    key = f'{norm(name)}|{norm(state)}'
    poly = find_polygon(name, state, fuzzy=False)
    home = poly or (find_polygon(CITY_DISTRICT[norm(name)], state, fuzzy=False) if norm(name) in CITY_DISTRICT else None)
    xy, src = pin_place(name, state, home), 'pin'
    if not xy:
        lgd_subs = [sdc for st in lgd_states_by_key.get(norm(state), []) for sdc in sub_by_state[st].get(norm(name), [])]
        exact_subs = [sdc for sdc in lgd_subs if sub_points.get(sdc)]
        if exact_subs:
            xy, src = median_point(sub_points[exact_subs[0]]), 'subdistrict'
    if not xy and home:
        xy, src = home[4], 'district-2011'
    if not xy:
        dcs = lgd_dist_by_name.get((norm(state), norm(name)), [])
        if dcs and dcs[0] in dist_xy:
            xy, src = dist_xy[dcs[0]], 'district'
    if not xy:
        lgd_subs = [sdc for st in lgd_states_by_key.get(norm(state), []) for sdc in sub_by_state[st].get(norm(name), [])]
        if lgd_subs and subdistricts[lgd_subs[0]]['district'] in dist_xy:
            xy, src = dist_xy[subdistricts[lgd_subs[0]]['district']], 'subdistrict-approx'
    if xy:
        out['cities'][key] = [round(xy[0], 4), round(xy[1], 4)]
        city_src[src] += 1
    else:
        city_src['missing'] += 1

Path(out_path).write_text(json.dumps(out, separators=(',', ':')))
print(f"districts: {len(out['districts'])}/{len(districts)} located ({sum(1 for p in dist_poly.values() if p)} via 2011 boundaries, {len(approx_districts)} approx)")
print(f"subdistricts: {exact} from PIN places, {approx} approx (district centre), {missing} missing of {len(subdistricts)}")
print(f"cities: {len(out['cities'])}/{len(city_rows)} located {dict(city_src)}")
missing_cities = [f'{n} ({s})' for n, s in city_rows if f'{norm(n)}|{norm(s)}' not in out['cities']]
if missing_cities:
    print('cities without coordinates:', missing_cities)
