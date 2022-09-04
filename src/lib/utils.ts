/**
 * シェーダーを生成する関数
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @return {*}  {WebGLShader}
 */
export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  // シェーダーを作成
  const shader = gl.createShader(type) as WebGLShader
  // GLSLのコードをGPUにアップロード
  gl.shaderSource(shader, source)
  // シェーダーをコンパイル
  gl.compileShader(shader)
  // 成功かどうかチェック
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  // エラー表示
  console.log(gl.getShaderInfoLog(shader))
  alert(gl.getShaderInfoLog(shader))
  // シェーダーを削除
  gl.deleteShader(shader)
  return null
}

/**
 * プログラムオブジェクトを生成しシェーダをリンクする関数
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vs
 * @param {WebGLShader} fs
 * @return {*}  {(WebGLProgram | null)}
 */
export const createProgram = (
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram | null => {
  // プログラムオブジェクトの生成
  const program = gl.createProgram() as WebGLProgram

  // プログラムオブジェクトにシェーダを割り当てる
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  // プログラムをリンク
  gl.linkProgram(program)

  // シェーダのリンクが正しく行われたかチェック
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // 成功していたらプログラムオブジェクトを有効にする
    gl.useProgram(program)
    // プログラムオブジェクトを返して終了
    return program
  } else {
    alert(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
}

/**
 * VBOを生成する関数
 * @param {WebGLRenderingContext} gl
 * @param {number[]} data
 * @return {*}  {(WebGLBuffer | null)}
 */
export const createVbo = (
  gl: WebGLRenderingContext,
  data: number[]
): WebGLBuffer | null => {
  // バッファオブジェクトの生成
  const vbo = gl.createBuffer()

  // バッファをバインド
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

  // バッファにデータをセット
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)

  // バッファのバインドを無効化
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return vbo
}

/**
 * IBOを生成する関数
 * @param {WebGLRenderingContext} gl
 * @param {number[]} data
 * @return {*}  {(WebGLBuffer | null)}
 * @memberof Canvas
 */
export const createIbo = (
  gl: WebGLRenderingContext,
  data: number[]
): WebGLBuffer | null => {
  // バッファオブジェクトの生成
  const ibo = gl.createBuffer()

  // バッファをバインド
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)

  // バッファにデータをセット
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)

  // バッファのバインドを無効化
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  return ibo
}

/**
 * VBOをバインドし登録する関数
 * @param {WebGLRenderingContext} gl
 * @param {WebGLBuffer[]} vbo
 * @param {number[]} attL
 * @param {number[]} attS
 */
export const setAttribute = (
  gl: WebGLRenderingContext,
  vbo: WebGLBuffer[],
  attL: number[],
  attS: number[]
): void => {
  // 引数として受け取った配列を処理する
  for (let i in vbo) {
    // バッファをバインド
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i])
    // attributeLocationを有効にする
    gl.enableVertexAttribArray(attL[i])
    // attributeLocationを通知し登録
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0)
  }
}

/**
 * トーラスのモデルデータを生成する関数
 * @param {number} row
 * @param {number} column
 * @param {number} irad
 * @param {number} orad
 * @return {*}  {number[][]}
 */
export const torus = (
  row: number,
  column: number,
  irad: number,
  orad: number
): number[][] => {
  const pos = new Array(),
    nor = new Array(),
    col = new Array(),
    idx = new Array()
  for (var i = 0; i <= row; i++) {
    var r = ((Math.PI * 2) / row) * i
    const rr = Math.cos(r)
    const ry = Math.sin(r)
    for (var ii = 0; ii <= column; ii++) {
      const tr = ((Math.PI * 2) / column) * ii
      const tx = (rr * irad + orad) * Math.cos(tr)
      const ty = ry * irad
      const tz = (rr * irad + orad) * Math.sin(tr)
      const rx = rr * Math.cos(tr)
      const rz = rr * Math.sin(tr)
      pos.push(tx, ty, tz)
      nor.push(rx, ry, rz)
      const tc = hsva((360 / column) * ii, 1, 1, 1) as number[]
      col.push(tc[0], tc[1], tc[2], tc[3])
    }
  }
  for (i = 0; i < row; i++) {
    for (ii = 0; ii < column; ii++) {
      r = (column + 1) * i + ii
      idx.push(r, r + column + 1, r + 1)
      idx.push(r + column + 1, r + column + 2, r + 1)
    }
  }
  return [pos, nor, col, idx]
}

/**
 * HSVカラー取得関数
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @param {number} a
 * @return {*}  {(number[] | null)}
 */
export const hsva = (
  h: number,
  s: number,
  v: number,
  a: number
): number[] | null => {
  if (s > 1 || v > 1 || a > 1) {
    return null
  }
  const th = h % 360
  const i = Math.floor(th / 60)
  const f = th / 60 - i
  const m = v * (1 - s)
  const n = v * (1 - s * f)
  const k = v * (1 - s * (1 - f))
  const color = new Array()
  if (!(s > 0) && !(s < 0)) {
    color.push(v, v, v, a)
  } else {
    const r = new Array(v, n, m, m, k, v)
    const g = new Array(k, v, v, n, m, m)
    const b = new Array(m, m, k, v, v, n)
    color.push(r[i], g[i], b[i], a)
  }
  return color
}
