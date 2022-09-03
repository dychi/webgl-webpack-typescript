import matIV from "./lib/minMatrix";

// Shader
import vertexSource from "./shaders/vertex.glsl";
import fragmentSource from "./shaders/fragment.glsl";

export class Canvas {
  // プロパティ
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  /**
   * Creates an instance of Canvas.
   * @memberof Canvas
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
    const vShaderText = vertexSource;
    const vShader = this.create_shader("vs", vShaderText);
    if (vShader == null) {
      return;
    }
    // フラグメントシェーダの生成
    const fShaderText = fragmentSource;
    const fShader = this.create_shader("fs", fShaderText);
    if (fShader == null) {
      return;
    }

    // プログラムオブジェクトの生成とリンク
    const prg = this.create_program(vShader, fShader) as WebGLProgram;

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
    const torusData = this.torus(32, 32, 1.0, 2.0);
    const position = torusData[0];
    const normal = torusData[1];
    const color = torusData[2];
    const index = torusData[3];

    // VBOの生成
    const position_vbo = this.create_vbo(position) as WebGLShader;
    const normal_vbo = this.create_vbo(normal) as WebGLShader;
    const color_vbo = this.create_vbo(color) as WebGLShader;

    // VBOを登録
    this.set_attribute(
      [position_vbo, normal_vbo, color_vbo],
      attLocation,
      attStride
    );

    // IBOの生成
    const ibo = this.create_ibo(index);
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

    // 恒常ループ
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
    loop();
  }

  /**
   * シェーダを生成する関数
   * @param {string} id
   * @param {string} shaderText
   * @return {*}  {(WebGLShader | null)}
   * @memberof Canvas
   */
  create_shader(id: string, shaderText: string): WebGLShader | null {
    // シェーダを格納する変数
    let shader: WebGLShader;

    switch (id) {
      case "vs":
        shader = this.gl.createShader(this.gl.VERTEX_SHADER) as WebGLShader;
        break;
      case "fs":
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER) as WebGLShader;
        break;
      default:
        return null;
    }

    // 生成されたシェーダにソースを割り当てる
    this.gl.shaderSource(shader, shaderText);

    // シェーダをコンパイルする
    this.gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      // 成功していたらシェーダを返して終了
      return shader;
    } else {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
    }
  }

  /**
   * プログラムオブジェクトを生成しシェーダをリンクする関数
   * @param {WebGLShader} vs
   * @param {WebGLShader} fs
   * @return {*}  {(WebGLProgram | null)}
   * @memberof Canvas
   */
  create_program(vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    // プログラムオブジェクトの生成
    this.program = this.gl.createProgram() as WebGLProgram;

    // プログラムオブジェクトにシェーダを割り当てる
    this.gl.attachShader(this.program, vs);
    this.gl.attachShader(this.program, fs);

    // シェーダをリンク
    this.gl.linkProgram(this.program);

    // シェーダのリンクが正しく行われたかチェック
    if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      // 成功していたらプログラムオブジェクトを有効にする
      this.gl.useProgram(this.program);
      // プログラムオブジェクトを返して終了
      return this.program;
    } else {
      alert(this.gl.getProgramInfoLog(this.program));
      return null;
    }
  }

  /**
   * VBOを生成する関数
   * @param {number[]} data
   * @return {*}  {(WebGLBuffer | null)}
   * @memberof Canvas
   */
  create_vbo(data: number[]): WebGLBuffer | null {
    // バッファオブジェクトの生成
    const vbo = this.gl.createBuffer();

    // バッファをバインド
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);

    // バッファにデータをセット
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(data),
      this.gl.STATIC_DRAW
    );

    // バッファのバインドを無効化
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    return vbo;
  }

  /**
   * VBOをバインドし登録する関数
   * @param {WebGLBuffer[]} vbo
   * @param {number[]} attL
   * @param {number[]} attS
   * @memberof Canvas
   */
  set_attribute(vbo: WebGLBuffer[], attL: number[], attS: number[]): void {
    // 引数として受け取った配列を処理する
    for (let i in vbo) {
      // バッファをバインド
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
      // attributeLocationを有効にする
      this.gl.enableVertexAttribArray(attL[i]);
      // attributeLocationを通知し登録
      this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
    }
  }

  /**
   * IBOを生成する関数
   * @param {number[]} data
   * @return {*}  {(WebGLBuffer | null)}
   * @memberof Canvas
   */
  create_ibo(data: number[]): WebGLBuffer | null {
    // バッファオブジェクトの生成
    const ibo = this.gl.createBuffer();

    // バッファをバインド
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);

    // バッファにデータをセット
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Int16Array(data),
      this.gl.STATIC_DRAW
    );

    // バッファのバインドを無効化
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    return ibo;
  }

  /**
   * トーラスのモデルデータを生成する関数
   * @param {number} row
   * @param {number} column
   * @param {number} irad
   * @param {number} orad
   * @return {*}  {number[][]}
   * @memberof Canvas
   */
  torus(row: number, column: number, irad: number, orad: number): number[][] {
    const pos = new Array(),
      nor = new Array(),
      col = new Array(),
      idx = new Array();
    for (var i = 0; i <= row; i++) {
      var r = ((Math.PI * 2) / row) * i;
      const rr = Math.cos(r);
      const ry = Math.sin(r);
      for (var ii = 0; ii <= column; ii++) {
        const tr = ((Math.PI * 2) / column) * ii;
        const tx = (rr * irad + orad) * Math.cos(tr);
        const ty = ry * irad;
        const tz = (rr * irad + orad) * Math.sin(tr);
        const rx = rr * Math.cos(tr);
        const rz = rr * Math.sin(tr);
        pos.push(tx, ty, tz);
        nor.push(rx, ry, rz);
        const tc = this.hsva((360 / column) * ii, 1, 1, 1) as number[];
        col.push(tc[0], tc[1], tc[2], tc[3]);
      }
    }
    for (i = 0; i < row; i++) {
      for (ii = 0; ii < column; ii++) {
        r = (column + 1) * i + ii;
        idx.push(r, r + column + 1, r + 1);
        idx.push(r + column + 1, r + column + 2, r + 1);
      }
    }
    return [pos, nor, col, idx];
  }

  /**
   * HSVカラー取得関数
   * @param {number} h
   * @param {number} s
   * @param {number} v
   * @param {number} a
   * @return {*}  {(number[] | null)}
   * @memberof Canvas
   */
  hsva(h: number, s: number, v: number, a: number): number[] | null {
    if (s > 1 || v > 1 || a > 1) {
      return null;
    }
    const th = h % 360;
    const i = Math.floor(th / 60);
    const f = th / 60 - i;
    const m = v * (1 - s);
    const n = v * (1 - s * f);
    const k = v * (1 - s * (1 - f));
    const color = new Array();
    if (!(s > 0) && !(s < 0)) {
      color.push(v, v, v, a);
    } else {
      const r = new Array(v, n, m, m, k, v);
      const g = new Array(k, v, v, n, m, m);
      const b = new Array(m, m, k, v, v, n);
      color.push(r[i], g[i], b[i], a);
    }
    return color;
  }
}
