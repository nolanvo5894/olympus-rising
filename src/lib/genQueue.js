import { generateMonster } from "./monsterGen.js";

const MAX_PARALLEL = 3;
const queue = [];
let active = 0;

function pump() {
  while (active < MAX_PARALLEL && queue.length) {
    const { region, opts, resolve, reject } = queue.shift();
    active++;
    generateMonster(region, opts)
      .then(resolve, reject)
      .finally(() => {
        active--;
        pump();
      });
  }
}

export function generateMonsterQueued(region, opts = {}, priority = "normal") {
  return new Promise((resolve, reject) => {
    const job = { region, opts, resolve, reject };
    if (priority === "high") queue.unshift(job);
    else queue.push(job);
    pump();
  });
}

export function queueStats() {
  return { active, pending: queue.length, max: MAX_PARALLEL };
}
