import matIV from "../../lib/minMatrix";
import * as utils from "../../lib/utils";

// Shader
import vertexSource from "./shaders/vertex.glsl";
import fragmentSource from "./shaders/fragment.glsl";

export class Work023 {
  // プロパティ
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  /**
   * Creates an instance of Work023.
   * @memberof Work023
   */
  constructor() {
    console.log("initializing canvas");
    // canvasエレメントを取得
    this.c = document.getElementById("canvas") as HTMLCanvasElement;
    if (this.c == null) {
      console.log("not found canvas");
      return;
    }
    this.c.width = 300;
    this.c.height = 300;

    // webglコンテキスト
    this.gl =
      this.c.getContext("webgl") ||
      (this.c.getContext("experimental-webgl") as WebGLRenderingContext);
    if (this.gl == null) {
      console.log("not found canvas");
      return;
    }

    // 頂点シェーダの生成
    const vShader = utils.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexSource
    );
    if (vShader == null) return;
    // フラグメントシェーダの生成
    const fShader = utils.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentSource
    );
    if (fShader == null) return;

    // プログラムオブジェクトの生成とリンク
    const prg = utils.createProgram(this.gl, vShader, fShader) as WebGLProgram;

    // attributeLocationの取得
    const attLocation: number[] = new Array(3);
    attLocation[0] = this.gl.getAttribLocation(prg, "position");
    attLocation[1] = this.gl.getAttribLocation(prg, "normal");
    attLocation[2] = this.gl.getAttribLocation(prg, "color");

    // attributeの要素数
    const attStride: number[] = new Array(3);
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // トーラスの頂点データを生成
    const torusData = utils.torus(32, 32, 1.0, 2.0);
    const position = torusData[0];
    const normal = torusData[1];
    const color = torusData[2];
    const index = torusData[3];

    // VBOの生成
    const position_vbo = utils.createVbo(this.gl, position) as WebGLShader;
    const normal_vbo = utils.createVbo(this.gl, normal) as WebGLShader;
    const color_vbo = utils.createVbo(this.gl, color) as WebGLShader;

    // VBOを登録
    utils.setAttribute(
      this.gl,
      [position_vbo, normal_vbo, color_vbo],
      attLocation,
      attStride
    );

    // IBOの生成
    const ibo = utils.createIbo(this.gl, index);
    // IBOをバインドして登録
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);

    // uniformLocationの取得
    const uniLocation: WebGLUniformLocation[] = new Array();
    uniLocation[0] = this.gl.getUniformLocation(
      prg,
      "mvpMatrix"
    ) as WebGLUniformLocation;
    uniLocation[1] = this.gl.getUniformLocation(
      prg,
      "invMatrix"
    ) as WebGLUniformLocation;
    uniLocation[2] = this.gl.getUniformLocation(
      prg,
      "lightDirection"
    ) as WebGLUniformLocation;

    /*
      minMatrix.tsを用いた行列関連処理
      matIVオブジェクトを生成
    */
    const m = new matIV();

    //
    const mMatrix = m.identity(m.create());
    const vMatrix = m.identity(m.create());
    const pMatrix = m.identity(m.create());
    const tmpMatrix = m.identity(m.create());
    const mvpMatrix = m.identity(m.create());
    const invMatrix = m.identity(m.create());

    // ビューxプロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, this.c.width / this.c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    // 平行光源の向き
    const lightDirection = [-0.5, 0.5, 0.5];
    // 環境光の色
    const ambientColor = [0.1, 0.1, 0.1, 1.0];

    // カウンタの宣言
    let count = 0;
    // カリングと深度テストを有効にする
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);

    // 恒常ループ関数
    const loop = (): void => {
      // canvasを初期化
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.clearDepth(1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      // カウンタをインクリメント
      count++;

      // カウンタを元にラジアンを算出
      var rad = ((count % 360) * Math.PI) / 180;

      // モデルをY軸を中心に回転する
      m.identity(mMatrix);
      m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
      m.multiply(tmpMatrix, mMatrix, mvpMatrix);

      // モデル座標変換行列から逆行列を生成
      m.inverse(mMatrix, invMatrix);

      // uniform変数の登録
      this.gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
      this.gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
      this.gl.uniform3fv(uniLocation[2], lightDirection);
      this.gl.uniform4fv(uniLocation[3], ambientColor);
      // インデックスを用いた描画命令
      this.gl.drawElements(
        this.gl.TRIANGLES,
        index.length,
        this.gl.UNSIGNED_SHORT,
        0
      );

      // コンテキストの再描画
      this.gl.flush();

      // ループのために再帰呼び出し
      setTimeout(loop, 1000 / 30);
    };
    // ループの実行
    loop();
  }
}
