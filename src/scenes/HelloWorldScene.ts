import Phaser, { Physics } from "phaser";

export default class HelloWorldScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private stars?: Phaser.Physics.Arcade.Group;
  private bombs?: Phaser.Physics.Arcade.Group;

  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private gameOver: boolean = false;

  constructor() {
    super("hello-world");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, "sky");

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 200, "ground");

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child) => {
      const c = child as Phaser.Physics.Arcade.Image;
      c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.handleBomb);

    this.gameOver = false;
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player?.setVelocityX(-160);
      this.player?.anims.play("left", true);
    } else if (this.cursors?.right?.isDown) {
      this.player?.setVelocityX(160);
      this.player?.anims.play("right", true);
    } else {
      this.player?.setVelocityX(0);
      this.player?.anims.play("turn");
    }

    if (this.cursors?.up.isDown && this.player?.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(
    player: Phaser.GameObjects.GameObject,
    star: Phaser.GameObjects.GameObject
  ) {
    const s = star as Phaser.Physics.Arcade.Image;
    s.disableBody(true, true);

    this.score += 10;
    this.scoreText?.setText(`score: ${this.score}`);

    if (this.stars?.countActive(true) === 0) {
      this.stars.children.iterate(c => {
        const child = c as Physics.Arcade.Image;
        child.enableBody(true, child.x, 0, true, true);
      });
      if (this.player) {
        const x = this.player?.x < 400 ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);
        const bomb = this.bombs?.create(x, 16, 'bomb') as Phaser.Physics.Arcade.Image;
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200,200), 20);
      }
    }
  }

  handleBomb(
    player: Phaser.GameObjects.GameObject,
    bomb: Phaser.GameObjects.GameObject
  ) {
    this.physics.pause();
    this.player?.setTint(0xff0000);
    this.player?.anims.play('turn');

    this.gameOver = true;
  }
}
