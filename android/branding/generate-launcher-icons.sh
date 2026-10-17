#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
source_icon="homeserv-symbol.png"
res_dir="../app/src/main/res"
command -v magick >/dev/null || { echo 'ImageMagick 7 is required.' >&2; exit 1; }
# Ignore nearly transparent generation noise when measuring the visible symbol.
visible_bounds=$(magick "$source_icon" -alpha extract -threshold 10% -format '%@' info:)
# Android adaptive foreground canvases are 108dp. Keep the symbol within the
# central 56dp so launcher masks and movement have sufficient safe padding.
for spec in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  IFS=: read -r density legacy_size adaptive_size <<< "$spec"
  target="$res_dir/mipmap-$density"
  mkdir -p "$target"
  symbol_size=$((adaptive_size * 52 / 100))
  magick "$source_icon" -crop "$visible_bounds" +repage -resize "${symbol_size}x${symbol_size}" \
    -gravity center -background none -extent "${adaptive_size}x${adaptive_size}" \
    "$target/ic_launcher_foreground.png"
  symbol_size=$((legacy_size * 76 / 100))
  magick "$source_icon" -crop "$visible_bounds" +repage -resize "${symbol_size}x${symbol_size}" \
    -gravity center -background white -extent "${legacy_size}x${legacy_size}" \
    "$target/ic_launcher.png"
  magick "$target/ic_launcher.png" \
    \( +clone -alpha extract -fill black -colorize 100 -fill white \
      -draw "circle $((legacy_size / 2)),$((legacy_size / 2)) $((legacy_size / 2)),0" \) \
    -alpha off -compose CopyOpacity -composite "$target/ic_launcher_round.png"
done
