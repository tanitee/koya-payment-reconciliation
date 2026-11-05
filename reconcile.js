
const fs = require("fs");

const lines = fs.readFileSync("payments.jsonl", "utf8").split(/\r?\n/);

const latestTransactions = new Map();

// Read and process payment events
for (const line of lines) {
  if (!line.trim()) continue;

  let event;

  // Ignore invalid JSON
  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }

  // Ignore events without a transaction ID
  if (!event.txn_id) continue;

  const existing = latestTransactions.get(event.txn_id);

  // keep latest event based on time
  if (
    !existing ||
    Date.parse(event.ts) > Date.parse(existing.ts)
  ) {
    latestTransactions.set(event.txn_id, event);
  }
}

let total = 0;
let count = 0;

for (const event of latestTransactions.values()) {
  if (event.status === "success") {
    total += Number(event.amount);
    count++;
  }
}

const expected = parseInt(
  fs.readFileSync("expected.txt", "utf8").trim(),
  10
);

if (count !== expected) {
  console.log(
    `Check failed: counted ${count} successful payments, expected ${expected}.`
  );
  console.log(
    "Something in the data isn't being handled the way the README describes."
  );
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
