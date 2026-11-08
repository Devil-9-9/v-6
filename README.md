# BLOCK OPS

Minecraft building + Call of Duty shooting, in the browser. Phone first. P2P multiplayer. Installable PWA.

## Run
Static site, no build step. ES modules need a server (not `file://`):

    npx serve .          # or: python3 -m http.server 8080

Deploy: push to GitHub, import into Vercel (Framework: Other, no build command). `vercel.json` is included.
For phone install, open the deployed HTTPS URL, then Add to Home Screen.

## Offline / no-CDN (recommended before shipping)
Libraries load from unpkg at pinned versions (Three r160, cannon-es 0.20, PeerJS 1.5.2) and are cached by the service worker.
To bundle them locally, run once with internet: `bash scripts/vendor.sh`

## The world (no limits)
- **Infinite in every direction, including up and down.** Chunks are 16x16x16 cubes generated on demand from the seed; there is no height or depth cap.
  (Practical limit: past roughly 100,000 blocks from the origin, 32-bit float precision makes movement jittery.)
- **Overworld:** continents, oceans, lakes, beaches, trees. Swim with JUMP (rise) / DUCK (dive). Water cancels fall damage.
- **Sky realms:** above the open sky (y 128+) an endless stack of floating-island realms, one every 128 blocks, each with its own
  islands and clouds. Reach them by building a tower or bridging upward. Clouds are soft: landing on one cancels fall damage.
- **Underworld:** dig down. Caves everywhere, then huge caverns with lava lakes and glowing crystals, forever downward. You get a headlamp underground.
- Blocks that lose their support fall (cannon-es, g = 9.81). Anything disconnected from the ground falls, including sky bases, so anchor them to an island.

## Life
- **Wildlife:** cows, pigs, sheep and chickens roam the land; fish swim in every ocean and lake. Shooting them heals you +10 HP.
- **Villages:** every ~160 blocks there is a village: flattened ground, a well, stone paths and five houses. Each house has a villager who
  walks the village by day, goes home at dusk and sleeps in bed at night, chats when you come close, and flees if you shoot them.
  A killed villager is replaced after a minute.

## Home screen (lobby)
A 3D lobby opens first: your soldier stands on a plaza in a blocky mountain village. Tap LOOK (or your name) to change name, skin, hair, face paint, hoodie and pants.
Your look is saved on the device and friends see it in the game. The SQUAD panel shows who joined; INVITE copies/shares a link (`?join=BO-XXXX-1234`) that joins the host automatically when a friend opens it.

## Realistic characters
LOOK -> CHARACTER: REMY, KACHUJIN, EVE (realistic textured models with real animations: idle, run, jump, reload, hit, die) or BLOCKY (colours, hair, face, jacket).
Your choice is saved and friends see it. GFX HIGH shows realistic bots and friends; GFX LOW keeps them blocky (faster on weak phones).
Models are in `assets/models/*.glb` (+ `meta.json` for the rifle grip). They are loaded on demand; if they cannot load the game falls back to blocky characters.
To change or add models: `python3 tools/fbx2glb.py --char X.fbx --out assets/models/x.glb --anims name=clip.fbx ...` (Mixamo FBX in, small GLB out; needs Pillow + numpy),
then `python3 tools/gun_meta.py assets/models/meta.json assets/models/x.glb x`. Keep the repo private: Mixamo characters may be used in your game but not redistributed as raw assets.

## Customise your HUD
Main menu or Pause -> CUSTOMIZE HUD. Drag any button or HUD element, then use Size / Opacity / Hide, Mirror L/R (left-handed), Reset.
Saved on your device. Pause with the pause button (phone) or Esc (PC).

## Tests
    node tests/run.mjs        # world, villages, oceans, infinite physics, combat, wildlife, HUD layout, IDs

## Controls
PC: WASD, Shift sprint, Space jump (hold to swim up), C crouch (dive), Esc pause, LMB shoot, RMB scope (place in build mode), R reload, 1-4 weapons,
F toggle BUILD/COMBAT, G place, X break, Q/E or wheel = block, 5-9 = block slots.
Phone: left stick move (push past the ring to sprint), drag right side to look, SHOOT / JUMP / RELOAD / SCOPE / BUILD /
PLACE / DUCK / RUN / SWAP / BLOCK buttons. In BUILD mode, SHOOT breaks blocks; PLACE works in any mode.

## Multiplayer
Your permanent ID (`BO-XXXX-1234`) is in the menu with a COPY button. A friend pastes it into JOIN.
The host's ID decides the world seed; the host sends all block edits to late joiners. Shots, block edits and hits sync over WebRTC.
Uses the free public PeerJS signalling server. Strict NAT/corporate networks may need a TURN server.

## Layout
    index.html  manifest.json  service-worker.js  vercel.json
    src/main.js                  menu + boot
    src/core/      Game, Physics (cannon-es), DayNight, Effects, Noise, Constants
    src/blocks/    World (3D chunks), Terrain, Village, ChunkMesher, BlockManager, BuildTool, TextureAtlas, BlockTypes
    src/weapons/   Weapon, AK47, Sniper, Pistol, Shotgun, WeaponManager, Ballistics, ViewModel
    src/player/    Player, VoxelBody, Humanoid, Character (blocky), Model (realistic GLB characters)
    src/ai/        Bot, Wildlife, Animal, Fish, Villager, Models
    src/controls/  InputState, DesktopControls, MobileControls
    src/multiplayer/ UniqueID, Network, RemotePlayer
    src/ui/        HUD, HudEditor, HudLayout, Lobby3D, Profile, Wardrobe, styles.css
    assets/models/ remy.glb kachujin.glb eve.glb meta.json   (realistic characters)
    tools/         fbx2glb.py, gun_meta.py, preview_glb.py (FBX -> GLB conversion + CPU preview)
    tests/         node tests/run.mjs
    src/audio/     Audio (synthesised, no audio files)

## v8 additions: flying, inventory, portals, vehicles, new weapons

- **Fly (no time/height limit):** double-tap Space (or Z; FLY button / double-tap JUMP on phone). Space up, C/DUCK down, Shift fast. Forward follows where you look. Works in the overworld, sky realm and underworld. Turning it off in mid-air gives a soft landing.
- **Inventory (I / BAG):** all blocks (31 types incl. obsidian, gold, lamp, quartz, tiles, wool, ice...), BUILDINGS (hotel, house, tower, lit portals), VEHICLES, TOOLS. Pick a hotbar slot, tap an item. Hotbar is saved on the device. In BUILD mode digits 1-8 pick hotbar slots; in COMBAT they pick weapons 1-8.
- **Portals:** 4x5 frame (2x3 opening). Obsidian = Underworld, Gold = Sky realm. Light with the PORTAL LIGHTER item (PLACE) or H, then stand inside ~1.5 s. You arrive on a platform with a return portal. Breaking the frame collapses the portal.
- **Vehicles (V / ENTER):** Jeep (Shift = nitro, runs enemies over), Boat (water), Helicopter (fly anywhere). Spawn from the inventory with PLACE. Vehicles are local to your game for now.
- **Weapons 5-8:** SMG, Rocket launcher (breaks blocks, hurts you too), Sword (hold to swing), Bow (hold to draw, release to shoot, arrows drop).
- Multiplayer: block edits (buildings, explosions, portals) are batched and synced; vehicles and arrow/rocket visuals are not synced yet.
