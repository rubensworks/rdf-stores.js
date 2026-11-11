window.BENCHMARK_DATA = {
  "lastUpdate": 1794401582351,
  "repoUrl": "https://github.com/rubensworks/rdf-stores.js",
  "entries": {
    "Store sizes": [
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "490330dd89140b2dcdda376bec38bc545a8ef9bf",
          "message": "Track store sizes of all index variants in CI (#57)",
          "timestamp": "2026-11-08T20:08:07+01:00",
          "tree_id": "09dfb69a64ba29b2c668c8d85898a756e4d5aee4",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/490330dd89140b2dcdda376bec38bc545a8ef9bf"
        },
        "date": 1794165128453,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.42,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.42 MiB; External: 0 MiB; Runs: [13.42,13.42,13.42]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.36,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.36 MiB; External: 0 MiB; Runs: [689.36,689.36,689.36]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.84 MiB; External: 0 MiB; Runs: [169.84,169.84,169.84]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.43,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.43 MiB; External: 0 MiB; Runs: [13.43,13.43,13.43]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.22,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.22 MiB; External: 0 MiB; Runs: [662.22,662.22,662.22]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.54,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 433 bytes; Heap: 13.54 MiB; External: 0 MiB; Runs: [13.54,13.54,13.54]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 710.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.61 MiB; External: 0 MiB; Runs: [710.61,710.61,710.61]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.46,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.46 MiB; External: 0 MiB; Runs: [487.45,487.46,487.46]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.76,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 280 bytes; Heap: 8.76 MiB; External: 0 MiB; Runs: [8.76,8.76,8.76]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 509.76,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.76 MiB; External: 0 MiB; Runs: [509.76,509.76,509.76]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.79,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.79 MiB; External: 0 MiB; Runs: [8.79,8.79,8.79]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 529.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1060 bytes; Heap: 529.82 MiB; External: 0 MiB; Runs: [529.82,529.82,529.82]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.54,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 433 bytes; Heap: 13.54 MiB; External: 0 MiB; Runs: [13.54,13.54,13.54]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 710.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.61 MiB; External: 0 MiB; Runs: [710.61,710.61,710.61]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.44,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.44 MiB; External: 0 MiB; Runs: [1.44,1.44,1.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 205.75,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 412 bytes; Heap: 205.75 MiB; External: 0 MiB; Runs: [205.75,205.75,205.75]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 509.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.83 MiB; External: 0 MiB; Runs: [509.83,509.83,509.83]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 347 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.42,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.41 MiB; External: 12.01 MiB; Runs: [12.42,12.42,12.42]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.16,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.16 MiB; External: 3.01 MiB; Runs: [3.16,3.16,3.16]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.07 MiB; External: 1.52 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 145.7,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 291 bytes; Heap: 113.7 MiB; External: 32 MiB; Runs: [145.7,145.7,145.7]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.98,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.98,18.98,18.98]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.18 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.09 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 160.14,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 320 bytes; Heap: 106.8 MiB; External: 53.34 MiB; Runs: [160.14,160.14,160.14]"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8ab00d0773a94355285949e7315f8d6615549036",
          "message": "Sort quads ranks that fit in 64 bits natively with Uint8Array (#52)\n\nThis makes insertions 26%~360% faster in ordered stores.",
          "timestamp": "2026-11-10T17:03:52+01:00",
          "tree_id": "92d707c628fc50f0f036aa50d7ab820fee4965e7",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/8ab00d0773a94355285949e7315f8d6615549036"
        },
        "date": 1794326874360,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.42,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.42 MiB; External: 0 MiB; Runs: [13.42,13.42,13.42]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.32,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.32 MiB; External: 0 MiB; Runs: [689.32,689.32,689.32]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.84 MiB; External: 0 MiB; Runs: [169.84,169.84,169.84]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.43,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.43 MiB; External: 0 MiB; Runs: [13.43,13.43,13.43]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.21,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.21 MiB; External: 0 MiB; Runs: [662.21,662.21,662.21]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.54,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 433 bytes; Heap: 13.54 MiB; External: 0 MiB; Runs: [13.54,13.54,13.54]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 710.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.61 MiB; External: 0 MiB; Runs: [710.61,710.61,710.61]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.45,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.45 MiB; External: 0 MiB; Runs: [487.45,487.46,487.45]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.76,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 280 bytes; Heap: 8.76 MiB; External: 0 MiB; Runs: [8.76,8.76,8.76]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 509.76,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.76 MiB; External: 0 MiB; Runs: [509.76,509.76,509.76]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.79,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.79 MiB; External: 0 MiB; Runs: [8.79,8.79,8.79]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 529.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1060 bytes; Heap: 529.82 MiB; External: 0 MiB; Runs: [529.82,529.82,529.82]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.54,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 433 bytes; Heap: 13.54 MiB; External: 0 MiB; Runs: [13.54,13.54,13.54]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 710.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.61 MiB; External: 0 MiB; Runs: [710.61,710.61,710.61]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.44,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.44 MiB; External: 0 MiB; Runs: [1.44,1.44,1.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 205.75,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 412 bytes; Heap: 205.75 MiB; External: 0 MiB; Runs: [205.75,205.75,205.75]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 509.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.83 MiB; External: 0 MiB; Runs: [509.83,509.83,509.83]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 347 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.41 MiB; External: 12.01 MiB; Runs: [12.43,12.43,12.43]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.17,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.16 MiB; External: 3.01 MiB; Runs: [3.17,3.17,3.17]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.06 MiB; External: 1.54 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 151.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 304 bytes; Heap: 113.71 MiB; External: 38.13 MiB; Runs: [151.83,151.83,151.83]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.99,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.99,18.99,18.99]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.19 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.1 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 160.14,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 320 bytes; Heap: 106.8 MiB; External: 53.34 MiB; Runs: [160.14,160.14,160.14]"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e45a5772228fda6d05700005c89d2b6e2428e856",
          "message": "Make bulk loads into sorted-blocks indexes cheaper (#53)\n\n* Fill an empty sorted-blocks index by copying whole leaves\n\nA batch added to an empty index is copied into leaves a leaf at a time,\ninstead of quad by quad, and merging compares quads in place instead of\ncreating a subarray per quad.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01UNM2PDyzVijfquXVY2Av52\n\n* Collect new terms with a bitmap, and sort them on their values\n\nAdding many terms at once collected the new ones by reading and writing the\nlabel of every encoding in the batch, and sorted them by comparing decoded\nterms. New plain encodings are now collected with a bitmap of the batch, and\nfor the default comparator, the new terms are grouped by term type and their\nvalues are sorted with a multikey quicksort, which compares the prefixes that\nmany values share, such as namespaces, only once. Literals with equal values\nare then ordered on the rest of the comparator.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01UNM2PDyzVijfquXVY2Av52\n\n* Sort a batch once for all sorted-blocks indexes\n\nA batch that every index merges was sorted by each index. It is now sorted\nonce, for the first index, and the order of every next index is derived from\nthe previous one with stable counting sorts on the term ranks of the component\nit moves forward, as GSOP to GPSO and GPSO to GOPS do. Indexes whose order can\nnot be derived this way still sort the batch themselves.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01UNM2PDyzVijfquXVY2Av52\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-11-11T09:19:00+01:00",
          "tree_id": "4142a2e73008f6fa25428d69af39e2a42b7bec25",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/e45a5772228fda6d05700005c89d2b6e2428e856"
        },
        "date": 1794385380862,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.42,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 429 bytes; Heap: 13.42 MiB; External: 0 MiB; Runs: [13.43,13.42,13.42]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.32,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.32 MiB; External: 0 MiB; Runs: [689.32,689.32,689.32]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.83 MiB; External: 0 MiB; Runs: [169.83,169.83,169.83]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.44,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.44 MiB; External: 0 MiB; Runs: [13.44,13.44,13.44]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.16,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.16 MiB; External: 0 MiB; Runs: [662.16,662.16,662.16]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 710.62,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.62 MiB; External: 0 MiB; Runs: [710.62,710.62,710.62]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.46,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.46 MiB; External: 0 MiB; Runs: [487.46,487.46,487.45]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.77,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.77 MiB; External: 0 MiB; Runs: [8.77,8.77,8.77]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 509.76,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.76 MiB; External: 0 MiB; Runs: [509.76,509.76,509.76]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 710.57,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.57 MiB; External: 0 MiB; Runs: [710.57,710.57,710.57]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.79,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.79 MiB; External: 0 MiB; Runs: [8.79,8.79,8.79]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 710.57,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.57 MiB; External: 0 MiB; Runs: [710.57,710.57,710.57]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 509.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.82 MiB; External: 0 MiB; Runs: [509.82,509.82,509.82]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 529.82,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1060 bytes; Heap: 529.82 MiB; External: 0 MiB; Runs: [529.82,529.82,529.82]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 710.57,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.57 MiB; External: 0 MiB; Runs: [710.57,710.57,710.62]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.44,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.44 MiB; External: 0 MiB; Runs: [1.44,1.44,1.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 205.75,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 412 bytes; Heap: 205.75 MiB; External: 0 MiB; Runs: [205.75,205.75,205.75]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 220.52,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 441 bytes; Heap: 220.52 MiB; External: 0 MiB; Runs: [220.52,220.52,220.52]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 509.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1020 bytes; Heap: 509.83 MiB; External: 0 MiB; Runs: [509.83,509.83,509.83]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 347 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 710.57,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1421 bytes; Heap: 710.57 MiB; External: 0 MiB; Runs: [710.57,710.57,710.57]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.42 MiB; External: 12.01 MiB; Runs: [12.43,12.43,12.43]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.17,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.15 MiB; External: 3.01 MiB; Runs: [3.17,3.17,3.17]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.06 MiB; External: 1.54 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 151.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 304 bytes; Heap: 113.71 MiB; External: 38.13 MiB; Runs: [151.83,151.83,151.83]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.99,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.99,18.99,18.99]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.19 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.1 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 160.14,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 320 bytes; Heap: 106.8 MiB; External: 53.34 MiB; Runs: [160.14,160.14,160.14]"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4bc418c1368cc6db75d991f9fb59b4ca70732f85",
          "message": "Encode literals and blank nodes without stringifying them\n\nStoring them keyed by their datatype, language, and direction\nis more efficient and more compact.",
          "timestamp": "2026-11-11T10:01:42+01:00",
          "tree_id": "e03b99d2ca488941498b87535bf38040b72ad0d3",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/4bc418c1368cc6db75d991f9fb59b4ca70732f85"
        },
        "date": 1794387891546,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.43,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.43 MiB; External: 0 MiB; Runs: [13.43,13.43,13.43]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.32,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.32 MiB; External: 0 MiB; Runs: [689.32,689.34,689.32]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.83 MiB; External: 0 MiB; Runs: [169.83,169.83,169.83]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.45 MiB; External: 0 MiB; Runs: [13.45,13.45,13.45]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.17,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.17 MiB; External: 0 MiB; Runs: [662.17,662.17,662.17]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 194.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.6 MiB; External: 0 MiB; Runs: [194.6,194.6,194.6]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 687.12,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 687.12 MiB; External: 0 MiB; Runs: [687.12,687.12,687.12]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.46,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.46 MiB; External: 0 MiB; Runs: [487.45,487.46,487.46]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.77,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.77 MiB; External: 0 MiB; Runs: [8.77,8.77,8.77]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 483.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 968 bytes; Heap: 483.83 MiB; External: 0 MiB; Runs: [483.83,483.83,483.83]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 485.18,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 970 bytes; Heap: 485.18 MiB; External: 0 MiB; Runs: [485.18,485.18,485.18]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 687.13,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 687.13 MiB; External: 0 MiB; Runs: [687.13,687.13,687.13]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.79,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.79 MiB; External: 0 MiB; Runs: [8.79,8.79,8.79]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 485.18,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 970 bytes; Heap: 485.18 MiB; External: 0 MiB; Runs: [485.18,485.18,485.18]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 687.13,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 687.13 MiB; External: 0 MiB; Runs: [687.13,687.13,687.13]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 485.17,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 970 bytes; Heap: 485.17 MiB; External: 0 MiB; Runs: [485.17,485.17,485.17]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 105 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 505.15,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1010 bytes; Heap: 505.15 MiB; External: 0 MiB; Runs: [505.15,505.15,505.15]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 687.12,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 687.12 MiB; External: 0 MiB; Runs: [687.12,687.12,687.12]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.2,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.2 MiB; External: 0 MiB; Runs: [2.2,2.2,2.2]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.45 MiB; External: 0 MiB; Runs: [1.45,1.45,1.45]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 179.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 360 bytes; Heap: 179.83 MiB; External: 0 MiB; Runs: [179.83,179.83,179.83]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 194.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.6 MiB; External: 0 MiB; Runs: [194.6,194.6,194.6]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 485.18,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 970 bytes; Heap: 485.18 MiB; External: 0 MiB; Runs: [485.18,485.18,485.18]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 348 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 687.13,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 687.13 MiB; External: 0 MiB; Runs: [687.13,687.13,687.11]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.42 MiB; External: 12.01 MiB; Runs: [12.43,12.43,12.43]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.17,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.15 MiB; External: 3.01 MiB; Runs: [3.17,3.17,3.17]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.06 MiB; External: 1.54 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 124.14,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 248 bytes; Heap: 86.02 MiB; External: 38.13 MiB; Runs: [124.14,124.14,124.14]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.99,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.99,18.99,18.99]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.19 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.1 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 134.39,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 269 bytes; Heap: 81.06 MiB; External: 53.34 MiB; Runs: [134.39,134.39,134.39]"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "07845ef5ca1f22f2617abfde57ad486ca2f481c2",
          "message": "Store deep copies of literals and blank nodes (#56)\n\nThis avoids V8 keeping track of larger chunks that originate from parsers,\nwhich led to higher memory usage.",
          "timestamp": "2026-11-11T10:07:12+01:00",
          "tree_id": "5968ff0aafe8bcf435fb0d8724958fd049459a60",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/07845ef5ca1f22f2617abfde57ad486ca2f481c2"
        },
        "date": 1794388266886,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.43,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.43 MiB; External: 0 MiB; Runs: [13.43,13.43,13.42]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.32,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.32 MiB; External: 0 MiB; Runs: [689.32,689.32,689.33]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.84 MiB; External: 0 MiB; Runs: [169.84,169.84,169.84]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.45 MiB; External: 0 MiB; Runs: [13.45,13.45,13.45]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.16,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.16 MiB; External: 0 MiB; Runs: [662.16,662.16,662.16]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 194.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.61 MiB; External: 0 MiB; Runs: [194.61,194.61,194.61]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.46,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.46 MiB; External: 0 MiB; Runs: [487.46,487.45,487.46]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.77,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.77 MiB; External: 0 MiB; Runs: [8.77,8.77,8.77]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.56,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.56 MiB; External: 0 MiB; Runs: [9.56,9.56,9.56]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 483.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 968 bytes; Heap: 483.84 MiB; External: 0 MiB; Runs: [483.84,483.84,483.84]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 484.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.6 MiB; External: 0 MiB; Runs: [484.6,484.6,484.58]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.79]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.8,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.8 MiB; External: 0 MiB; Runs: [8.8,8.8,8.8]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 484.59,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.59 MiB; External: 0 MiB; Runs: [484.59,484.59,484.6]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.79,686.78]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 484.57,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.57 MiB; External: 0 MiB; Runs: [484.57,484.57,484.59]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 105 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 504.66,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1009 bytes; Heap: 504.66 MiB; External: 0 MiB; Runs: [504.66,504.66,504.66]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.54,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.45 MiB; External: 0 MiB; Runs: [1.45,1.45,1.45]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 179.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 360 bytes; Heap: 179.84 MiB; External: 0 MiB; Runs: [179.84,179.84,179.84]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 194.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.61 MiB; External: 0 MiB; Runs: [194.61,194.61,194.61]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 484.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.6 MiB; External: 0 MiB; Runs: [484.6,484.59,484.6]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 348 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.79,686.78,686.78]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.42 MiB; External: 12.01 MiB; Runs: [12.43,12.43,12.43]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.17,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.15 MiB; External: 3.01 MiB; Runs: [3.17,3.17,3.17]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.06 MiB; External: 1.54 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 114.58,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 229 bytes; Heap: 76.46 MiB; External: 38.13 MiB; Runs: [114.58,114.58,114.58]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.99,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.99,18.99,18.99]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.19 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.1 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 134.4,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 269 bytes; Heap: 81.06 MiB; External: 53.34 MiB; Runs: [134.4,134.4,134.4]"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "rubensworks@users.noreply.github.com",
            "name": "Ruben Taelman",
            "username": "rubensworks"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e653f1597ecff8debae205b9cee714ac9dcfedc6",
          "message": "Optimize distinct terms by skipping irrelevant leaves (#61)",
          "timestamp": "2026-11-11T13:49:05+01:00",
          "tree_id": "3676608be69c1746db75fcc21013d9b4c75310e7",
          "url": "https://github.com/rubensworks/rdf-stores.js/commit/e653f1597ecff8debae205b9cee714ac9dcfedc6"
        },
        "date": 1794401581544,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "1 Record index (Map<number>) | triples",
            "value": 2.93,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.93 MiB; External: 0 MiB; Runs: [2.93,2.93,2.93]"
          },
          {
            "name": "1 Record index (Map<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Map<number>) | quoted",
            "value": 0.59,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 19 bytes; Heap: 0.59 MiB; External: 0 MiB; Runs: [0.59,0.59,0.59]"
          },
          {
            "name": "1 Record index (Map<number>) | entities",
            "value": 197.41,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 395 bytes; Heap: 197.41 MiB; External: 0 MiB; Runs: [197.41,197.41,197.41]"
          },
          {
            "name": "3 Record indexes (Map<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Map<number>) | quoted",
            "value": 13.43,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.43 MiB; External: 0 MiB; Runs: [13.43,13.43,13.43]"
          },
          {
            "name": "3 Record indexes (Map<number>) | entities",
            "value": 689.32,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1379 bytes; Heap: 689.32 MiB; External: 0 MiB; Runs: [689.32,689.32,689.34]"
          },
          {
            "name": "1 Record index (Record<number>) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number>) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number>) | quoted",
            "value": 0.53,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 17 bytes; Heap: 0.53 MiB; External: 0 MiB; Runs: [0.53,0.53,0.53]"
          },
          {
            "name": "1 Record index (Record<number>) | entities",
            "value": 169.83,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 340 bytes; Heap: 169.83 MiB; External: 0 MiB; Runs: [169.83,169.83,169.83]"
          },
          {
            "name": "3 Record indexes (Record<number>) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number>) | quoted",
            "value": 13.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 430 bytes; Heap: 13.45 MiB; External: 0 MiB; Runs: [13.44,13.45,13.45]"
          },
          {
            "name": "3 Record indexes (Record<number>) | entities",
            "value": 662.16,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1324 bytes; Heap: 662.16 MiB; External: 0 MiB; Runs: [662.16,662.16,662.16]"
          },
          {
            "name": "1 Record index (Record<number> FT) | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record index (Record<number> FT) | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record index (Record<number> FT) | entities",
            "value": 194.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.61 MiB; External: 0 MiB; Runs: [194.61,194.61,194.61]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (Record<number> FT) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "1 Map index (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index (Map<number>) | entities",
            "value": 182.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.64 MiB; External: 0 MiB; Runs: [182.64,182.64,182.64]"
          },
          {
            "name": "3 Map indexes (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes (Map<number>) | entities",
            "value": 487.46,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 975 bytes; Heap: 487.46 MiB; External: 0 MiB; Runs: [487.46,487.46,487.46]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | triples",
            "value": 7.44,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.44 MiB; External: 0 MiB; Runs: [7.44,7.44,7.44]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | quoted",
            "value": 1.12,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 36 bytes; Heap: 1.12 MiB; External: 0 MiB; Runs: [1.12,1.12,1.12]"
          },
          {
            "name": "1 Map index recursive (Map<number>) | entities",
            "value": 182.65,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 365 bytes; Heap: 182.65 MiB; External: 0 MiB; Runs: [182.65,182.65,182.65]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | quoted",
            "value": 8.82,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.82 MiB; External: 0 MiB; Runs: [8.82,8.82,8.82]"
          },
          {
            "name": "3 Map indexes recursive (Map<number>) | entities",
            "value": 486.64,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 973 bytes; Heap: 486.64 MiB; External: 0 MiB; Runs: [486.64,486.64,486.64]"
          },
          {
            "name": "1 Map index (symbol) | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map index (symbol) | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map index (symbol) | quoted",
            "value": 1.06,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 34 bytes; Heap: 1.06 MiB; External: 0 MiB; Runs: [1.06,1.06,1.06]"
          },
          {
            "name": "1 Map index (symbol) | entities",
            "value": 159.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 319 bytes; Heap: 159.44 MiB; External: 0 MiB; Runs: [159.44,159.44,159.44]"
          },
          {
            "name": "3 Map indexes (symbol) | triples",
            "value": 22.22,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.22 MiB; External: 0 MiB; Runs: [22.22,22.22,22.22]"
          },
          {
            "name": "3 Map indexes (symbol) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (symbol) | quoted",
            "value": 8.77,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 281 bytes; Heap: 8.77 MiB; External: 0 MiB; Runs: [8.77,8.77,8.77]"
          },
          {
            "name": "3 Map indexes (symbol) | entities",
            "value": 463.44,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 927 bytes; Heap: 463.44 MiB; External: 0 MiB; Runs: [463.44,463.44,463.44]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | quoted",
            "value": 9.56,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.56 MiB; External: 0 MiB; Runs: [9.56,9.56,9.56]"
          },
          {
            "name": "3 Nested Map Recursive Quoted indexes with indexed quoted dict (number) | entities",
            "value": 483.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 968 bytes; Heap: 483.84 MiB; External: 0 MiB; Runs: [483.84,483.84,483.84]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | quoted",
            "value": 9.16,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.16 MiB; External: 0 MiB; Runs: [9.16,9.16,9.16]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated quoted dict (number) | entities",
            "value": 484.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.6 MiB; External: 0 MiB; Runs: [484.6,484.59,484.6]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | quoted",
            "value": 10.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 321 bytes; Heap: 10.02 MiB; External: 0 MiB; Runs: [10.02,10.02,10.02]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated quoted dict (number) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 8.8,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 282 bytes; Heap: 8.8 MiB; External: 0 MiB; Runs: [8.8,8.8,8.8]"
          },
          {
            "name": "3 Nested Map Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 484.59,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.59 MiB; External: 0 MiB; Runs: [484.59,484.59,484.6]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | quoted",
            "value": 10.1,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 323 bytes; Heap: 10.1 MiB; External: 0 MiB; Runs: [10.1,10.1,10.1]"
          },
          {
            "name": "3 Nested Record Quoted indexes with separated referential quoted dict (number) | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quads",
            "value": 6.52,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.52 MiB; External: 0 MiB; Runs: [6.52,6.52,6.52]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | quoted",
            "value": 9.15,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 293 bytes; Heap: 9.15 MiB; External: 0 MiB; Runs: [9.15,9.15,9.15]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY | entities",
            "value": 484.59,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.59 MiB; External: 0 MiB; Runs: [484.59,484.58,484.59]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | triples",
            "value": 22.23,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.23 MiB; External: 0 MiB; Runs: [22.23,22.23,22.23]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 105 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | quoted",
            "value": 9.19,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 294 bytes; Heap: 9.19 MiB; External: 0 MiB; Runs: [9.19,9.19,9.19]"
          },
          {
            "name": "3 Map indexes (number) OPT-QUERY-NODES | entities",
            "value": 504.66,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1009 bytes; Heap: 504.66 MiB; External: 0 MiB; Runs: [504.66,504.66,504.66]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | triples",
            "value": 8.7,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.7 MiB; External: 0 MiB; Runs: [8.7,8.7,8.7]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | quoted",
            "value": 13.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 434 bytes; Heap: 13.55 MiB; External: 0 MiB; Runs: [13.55,13.55,13.55]"
          },
          {
            "name": "3 Record indexes (number) OPT-INGEST | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | triples",
            "value": 7.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 30 bytes; Heap: 7.43 MiB; External: 0 MiB; Runs: [7.43,7.43,7.43]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quads",
            "value": 2.19,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 35 bytes; Heap: 2.19 MiB; External: 0 MiB; Runs: [2.19,2.19,2.19]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | quoted",
            "value": 1.45,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 46 bytes; Heap: 1.45 MiB; External: 0 MiB; Runs: [1.45,1.45,1.45]"
          },
          {
            "name": "1 Map indexes (number) OPT-QUERY | entities",
            "value": 179.84,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 360 bytes; Heap: 179.84 MiB; External: 0 MiB; Runs: [179.84,179.84,179.84]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | triples",
            "value": 2.92,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 12 bytes; Heap: 2.92 MiB; External: 0 MiB; Runs: [2.92,2.92,2.92]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quads",
            "value": 0.89,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 14 bytes; Heap: 0.89 MiB; External: 0 MiB; Runs: [0.89,0.89,0.89]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | quoted",
            "value": 0.91,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 29 bytes; Heap: 0.91 MiB; External: 0 MiB; Runs: [0.91,0.91,0.91]"
          },
          {
            "name": "1 Record indexes (number) OPT-INGEST | entities",
            "value": 194.61,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 389 bytes; Heap: 194.61 MiB; External: 0 MiB; Runs: [194.61,194.61,194.61]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | triples",
            "value": 22.24,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 89 bytes; Heap: 22.24 MiB; External: 0 MiB; Runs: [22.24,22.24,22.24]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quads",
            "value": 6.53,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 104 bytes; Heap: 6.53 MiB; External: 0 MiB; Runs: [6.53,6.53,6.53]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | quoted",
            "value": 9.55,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 306 bytes; Heap: 9.55 MiB; External: 0 MiB; Runs: [9.55,9.55,9.55]"
          },
          {
            "name": "3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY | entities",
            "value": 484.6,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 969 bytes; Heap: 484.6 MiB; External: 0 MiB; Runs: [484.6,484.6,484.6]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | triples",
            "value": 8.71,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 35 bytes; Heap: 8.71 MiB; External: 0 MiB; Runs: [8.71,8.71,8.71]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quads",
            "value": 2.62,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 42 bytes; Heap: 2.62 MiB; External: 0 MiB; Runs: [2.62,2.62,2.62]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | quoted",
            "value": 10.86,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 348 bytes; Heap: 10.86 MiB; External: 0 MiB; Runs: [10.86,10.86,10.86]"
          },
          {
            "name": "3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST | entities",
            "value": 686.78,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 1374 bytes; Heap: 686.78 MiB; External: 0 MiB; Runs: [686.78,686.78,686.78]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | triples",
            "value": 12.43,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 50 bytes; Heap: 0.42 MiB; External: 12.01 MiB; Runs: [12.43,12.43,12.43]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quads",
            "value": 3.17,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 51 bytes; Heap: 0.15 MiB; External: 3.01 MiB; Runs: [3.17,3.17,3.17]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | quoted",
            "value": 2.6,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 83 bytes; Heap: 1.06 MiB; External: 1.54 MiB; Runs: [2.6,2.6,2.6]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK | entities",
            "value": 114.58,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 229 bytes; Heap: 76.46 MiB; External: 38.13 MiB; Runs: [114.58,114.58,114.58]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | triples",
            "value": 18.99,
            "unit": "MiB",
            "extra": "Quads: 262144; Per quad: 76 bytes; Heap: 0.59 MiB; External: 18.4 MiB; Runs: [18.99,18.99,18.99]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quads",
            "value": 4.36,
            "unit": "MiB",
            "extra": "Quads: 65536; Per quad: 70 bytes; Heap: 0.19 MiB; External: 4.17 MiB; Runs: [4.36,4.36,4.36]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | quoted",
            "value": 3.02,
            "unit": "MiB",
            "extra": "Quads: 32768; Per quad: 97 bytes; Heap: 1.1 MiB; External: 1.92 MiB; Runs: [3.02,3.02,3.02]"
          },
          {
            "name": "3 sorted-blocks indexes with indexed quoted dict (number), added one by one | entities",
            "value": 134.4,
            "unit": "MiB",
            "extra": "Quads: 524288; Per quad: 269 bytes; Heap: 81.06 MiB; External: 53.34 MiB; Runs: [134.4,134.4,134.4]"
          }
        ]
      }
    ]
  }
}