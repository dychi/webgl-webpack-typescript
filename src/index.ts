import { Render } from "./works/index";

document.addEventListener("DOMContentLoaded", () => {
  const path = location.search.split("=")[1];
  console.log(path);
  new Render(path);
});
