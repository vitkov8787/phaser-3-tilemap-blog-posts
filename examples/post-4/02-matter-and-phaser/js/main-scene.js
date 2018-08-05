export default class MainScene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map.json");
    this.load.image("kenney-tileset-64px", "../assets/tilesets/kenney-tileset-64px.png");

    // An atlas is a way to pack multiple images together into one texture. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    // Set colliding tiles, same as with arcade physics (AP). We'll just make everything collide for
    // now.
    groundLayer.setCollisionByExclusion([-1, 0]);
    lavaLayer.setCollisionByExclusion([-1, 0]);

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP). The body will be accessible via tile.physics.matterBody.
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    // Drop a couple matter-enabled emoji images into the world
    this.matter.add.image(275, 300, "emoji", "1f92c", { restitution: 1 }).setScale(0.5);
    this.matter.add.image(300, 250, "emoji", "1f60d", { restitution: 1 }).setScale(0.5);
    this.matter.add.image(325, 300, "emoji", "1f4a9", { restitution: 1 }).setScale(0.5);

    // Drop some more emojis when the mouse is pressed. To randomize the frame, we'll grab all the
    // frame names from the atlas.
    const frameNames = Object.keys(this.cache.json.get("emoji").frames);
    this.input.on("pointerdown", () => {
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
      for (let i = 0; i < 4; i++) {
        const x = worldPoint.x + Phaser.Math.RND.integerInRange(-5, 5);
        const y = worldPoint.y + Phaser.Math.RND.integerInRange(-5, 5);
        const frame = Phaser.Utils.Array.GetRandom(frameNames);
        this.matter.add.image(x, y, "emoji", frame, { restitution: 1 }).setScale(0.5);
      }
    });

    // Our canvas is now "clickable" so let's update the cursor to a custom pointer
    this.input.setDefaultCursor("url(../assets/cursors/pointer.cur), pointer");

    // Normally, we could just set the "debug" property to true in our game config, but we'll do
    // something a little more complicated here toggle the debug graphics on the fly. It's worth
    // noting that the debug renderer is slow!
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = false;
    this.input.keyboard.on("keydown_D", event => {
      this.matter.world.drawDebug = !this.matter.world.drawDebug;
      this.matter.world.debugGraphic.clear();
    });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5
    };
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

    const text = 'Left-click to emoji.\nArrows to scroll.\nPress "D" to see Matter bodies.';
    const help = this.add.text(16, 16, text, {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    });
    help.setScrollFactor(0).setDepth(1000);
  }

  update(time, delta) {
    this.controls.update(delta);
  }
}