// Shader
import vertexSource from "./shaders/vertex.glsl";
import fragmentSource from "./shaders/fragment.glsl";

export class Canvas {
  // プロパティ
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor() {
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
    var vShaderText = vertexSource;
    var vShader = this.create_shader("vs", vShaderText);
    if (vShader == null) {
      return;
    }
    // フラグメントシェーダの生成
    var fShaderText = fragmentSource;
    var fShader = this.create_shader("fs", fShaderText);
    if (fShader == null) {
      return;
    }
  }

  // シェーダを生成する関数
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
  // プログラムオブジェクトを生成しシェーダをリンクする関数
  create_program(vs: string, fs: string): WebGLProgram | null {
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
}
