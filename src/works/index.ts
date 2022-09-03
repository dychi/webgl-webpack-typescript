import { Work022 } from "./w022/canvas";

export class Render {
  constructor(path: string) {
    if (path == "w022") new Work022();
    else {
      console.log("specify query with `?path=`");
    }
  }
}
