# Unity WebGL on hanzo.app

A real Unity WebGL build served cross-origin-isolated, so `crossOriginIsolated === true`
and `SharedArrayBuffer` is available — the gate a multithreaded Unity build needs.

Live: https://unity-webgl.hanzo.app

Declare `"framework": "unity"` on the project and clients/sites serves
`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` on
the document and `Cross-Origin-Resource-Policy: same-origin` on every asset, plus the
`application/wasm` / `application/octet-stream` MIME types the Unity loader requires for
`.wasm` and `.data`. Third-party scripts on such a page must carry
`crossorigin="anonymous"` or COEP blocks them.

## Swap in your own build

Unity's build output is `<name>.loader.js`, `<name>.framework.js`, `<name>.data`,
`<name>.wasm`. Rename them with a content hash (`reef-<sha8>.*` here) and point the `BUILD`
constant in `index.html` at the new stem — a non-fingerprinted name lets a redeploy serve
the old loader against the new wasm, which hangs silently.

## Deploy to hanzo.app

An engine build is far bigger than the 4 MiB the public edge accepts in one request
body, so games ship through the **release lane**, not the artifact lane: put the built
tree in your object space, then publish it server-side.

```sh
# 1. declare the engine — `unity`, `unreal`, `godot` make clients/sites serve the
#    site cross-origin-isolated (COOP/COEP) so multithreaded WASM gets SharedArrayBuffer
curl -X POST https://api.hanzo.ai/v1/projects -H "Authorization: Bearer $TOKEN" \
  -H "X-Org-Id: $ORG" -H "Content-Type: application/json" \
  -d "{\"slug\":\"my-game\",\"name\":\"my-game\",\"framework\":\"godot\"}"

# 2. stage the build to s3.hanzo.ai under <org>/_stage/my-game/
# 3. promote it into an immutable content-addressed release + flip the pointer
curl -X POST https://api.hanzo.ai/v1/sites/my-game/publish -H "Authorization: Bearer $TOKEN" \
  -H "X-Org-Id: $ORG" -H "Content-Type: application/json" -d "{\"source\":\"_stage/my-game\"}"
```

**Fingerprint your asset names.** The site server serves a content-hashed filename
`immutable` and everything else with a plain `max-age`. A redeploy that reuses the same
asset name leaves browsers and the CDN running the OLD loader against the NEW binary —
for a WASM app that is a silent, permanent hang with no error, not a visible failure.

## License and attribution

Apache-2.0. The `Build/` and `TemplateData/` payloads are the example Unity WebGL build
from [Marinerer/unity-webgl](https://github.com/Marinerer/unity-webgl) (Apache-2.0),
renamed with a content hash. Unity is a trademark of Unity Technologies.
