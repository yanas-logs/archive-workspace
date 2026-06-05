import { Pulse } from "./pulse.js";
import { Stain } from "./stain.js";

document.addEventListener("DOMContentLoaded", () => {
  const pulse = Pulse();
  const stain = Stain();

  pulse.start();
  stain.generate();
});
