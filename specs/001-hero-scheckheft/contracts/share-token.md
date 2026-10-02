# Contract: Share token

The token in `/share/:token` carries everything the share view needs, so the link opens on a
device that has never loaded the prototype (FR-023a).

## Format

`token = base64url( JSON.stringify(payload) )`, no padding.

```ts
type SharePayload = {
  v: 1;                 // format version
  o: string;            // object id, e.g. "lindenstrasse-12"
  s: string[];          // sections: "historie" | "dokumente" | "kosten" | "faelligkeiten"
  c: string;            // created, YYYY-MM-DD; also the anchor date for fixtures
  e: string;            // expires, YYYY-MM-DD
  x: Array<{            // entries added during the demo for this object
    k: string;          //   scenario id, e.g. "s1-elektro"
    d: string;          //   entry date, YYYY-MM-DD
    i?: number;         //   interval override in months, if edited
    f?: {               //   edited fields of an upload suggestion, if any
      t?: string; a?: string; c?: number;
    };
  }>;
};
```

## Behaviour

| Case | Result |
|------|--------|
| Decodes, `v` is 1, `o` known, today ≤ `e` | Verkaufsmappe for `o`, built from `buildFixtures(c)` plus `x`, limited to `s` |
| today > `e` | "Diese Verkaufsmappe ist nicht mehr verfügbar", no object data |
| Not base64url, not JSON, wrong `v`, unknown `o`, missing field | same message, no object data, no console error |
| `x` names an unknown scenario | that item is ignored; the rest is shown |

## Guarantees

- `decodeShareToken(encodeShareToken(p))` equals `p` for every valid payload.
- The view derived from a token is the same on every device and does not read `localStorage`.
- A link created earlier is not affected by later demo actions or by "Demo zurücksetzen".
- Owner photos are not part of the token; an uploaded invoice appears in the share view with
  the rendered document preview.

## Not provided

The token is neither secret nor signed. It demonstrates the sharing flow, not access control.
