#!/bin/bash
# Scarica la zona tra Bagnoli e il porto (14.160-14.264 E, 40.788-40.852 N) a riquadri piccoli
mkdir -p "${1:-riquadri}" && cd "${1:-riquadri}"
for lat in $(seq 40.788 0.008 40.844); do
  for lon in $(seq 14.160 0.013 14.251); do
    la2=$(python3 -c "print(round($lat+0.008,3))"); lo2=$(python3 -c "print(round($lon+0.013,3))")
    f="t_${lon}_${lat}.xml"
    [ -s "$f" ] && continue
    for try in 1 2 3; do
      code=$(curl -sS --compressed --max-time 120 -A "coppa-america-napoli-guide/1.0 (map build)" -o "$f" -w '%{http_code}' "https://api.openstreetmap.org/api/0.6/map?bbox=$lon,$lat,$lo2,$la2")
      [ "$code" = "200" ] && break
      echo "retry $f $code"; rm -f "$f"; sleep 5
    done
    echo "$f $code $(stat -c %s "$f" 2>/dev/null)"
    sleep 1
  done
done
echo DONE
