import { Work022 } from "./w022/canvas";
import { Work023 } from "./w023/canvas";

export class Render {
  constructor(path: string) {
    if (path == "w022") new Work022();
    else if (path == "w023") new Work023();
    else {
      console.log("specify query with `?path=`");
    }
  }
}
