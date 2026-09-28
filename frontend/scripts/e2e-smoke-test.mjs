/**
 * EcoScrap — End-to-end API smoke test
 * Verifies the real backend flow through the application's own API modules.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { registerUser, loginUser } from "../src/api/auth.js";
import {
  createLot,
  getLots,
  predictImage,
  matchRecyclers,
  estimatePrice,
} from "../src/api/lots.js";
import {
  createHandover,
  getHandovers,
  updateHandoverStatus,
} from "../src/api/handovers.js";
import { getPriceBoard } from "../src/api/priceBoard.js";
import { getHandoverRecord } from "../src/api/traceability.js";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const QA = {
  collector: {
    name: "QA Collector",
    email: "qa.ecoscrap.collector@example.com",
    password: "qa-pass-1234",
  },
  recycler: {
    name: "QA Recycler",
    email: "qa.ecoscrap.recycler@example.com",
    password: "qa-pass-1234",
  },
};

const results = [];
function record(ok, label, detail = "") {
  results.push({ ok, label });
  if (ok) {
    console.log(`PASS  ${label}`);
  } else {
    console.error(`FAIL  ${label} ${detail}`);
  }
}

async function loginOrRegister(account, role, recyclerId = null) {
  try {
    const s = await loginUser(account.email, account.password);
    localStorage.setItem("access_token", s.access_token);
    return s.user;
  } catch {
    await registerUser(account.name, account.email, account.password, role, recyclerId);
    const s = await loginUser(account.email, account.password);
    localStorage.setItem("access_token", s.access_token);
    return s.user;
  }
}

function findSampleImage() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const uploadsDir = path.resolve(here, "../../backend/uploads");
  if (!existsSync(uploadsDir)) return null;
  for (const name of ["IMG-187acbb8.jpg", "IMG-3bc64cb6.jpg"]) {
    const candidate = path.join(uploadsDir, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function run() {
  console.log("\nEcoScrap end-to-end API smoke test\n----------------------------------");
  let collector = null;
  try {
    collector = await loginOrRegister(QA.collector, "collector");
    record(Boolean(collector) && Boolean(localStorage.getItem("access_token")), "Collector register/login (JWT stored)");
  } catch (err) {
    record(false, "Collector register/login", err.message);
    return;
  }

  let prediction = null;
  const img = findSampleImage();
  if (img) {
    try {
      const file = new File([readFileSync(img)], "qa-sample.jpg", { type: "image/jpeg" });
      prediction = await predictImage(file);
      record(Boolean(prediction?.predicted_class), `AI prediction (${prediction.predicted_class}, ${Number(prediction.confidence).toFixed(2)})`);
    } catch (err) {
      record(false, "AI prediction", err.message);
    }
  }

  const mat = prediction?.predicted_class || "PCB";
  const conf = Number(prediction?.confidence || 0);
  const confPct = conf > 1 ? conf : conf * 100;

  let lot = null;
  try {
    const created = await createLot({
      material_category: mat,
      material_subcategory: mat,
      weight_kg: 12.5,
      location: "Gorakhpur",
      ai_prediction: mat,
      ai_confidence: confPct,
    });
    lot = created.lot;
    record(Boolean(lot?.lot_id), `Create lot (${lot?.lot_id})`);
  } catch (err) {
    record(false, "Create lot", err.message);
    return;
  }

  try {
    const lots = await getLots();
    record(Array.isArray(lots) && lots.some((x) => x.lot_id === lot.lot_id), `Get lots (found ${lot.lot_id})`);
  } catch (err) {
    record(false, "Get lots", err.message);
  }

  try {
    const p = await estimatePrice(mat, mat, "Gorakhpur", 12.5);
    record(Number(p?.estimated_value) > 0, `Price estimate (₹${Number(p?.estimated_value || 0).toFixed(0)})`);
  } catch (err) {
    record(false, "Price estimate", err.message);
  }

  try {
    const board = await getPriceBoard();
    record(Array.isArray(board) && board.length > 0, `Price board (${board.length} materials)`);
  } catch (err) {
    record(false, "Price board", err.message);
  }

  let recycler = null;
  try {
    const match = await matchRecyclers(mat, "Gorakhpur", 12.5);
    const list = match.recyclers || [];
    recycler = list.find((x) => String(x.authorization_status).toLowerCase() === "authorized") || list[0];
    record(Boolean(recycler), `Recycler matching (${list.length} matches, chosen ${recycler?.recycler_id})`);
  } catch (err) {
    record(false, "Recycler matching", err.message);
  }

  if (!recycler) return;

  let handover = null;
  try {
    const h = await createHandover({
      lot_id: lot.lot_id,
      recycler_id: recycler.recycler_id,
      estimated_value: Number(lot.estimated_value || 0),
    });
    handover = h.handover;
    record(Boolean(handover?.handover_id), `Create handover (${handover?.handover_id})`);
  } catch (err) {
    record(false, "Create handover", err.message);
    return;
  }

  try {
    await loginOrRegister(QA.recycler, "recycler", recycler.recycler_id);
    for (const [st, pay] of [["Confirmed", null], ["E-Waste Handed Over", null], ["Completed", "Paid"]]) {
      await updateHandoverStatus(handover.handover_id, st, pay);
    }
    record(true, "Handover transitions: Confirmed → Handed Over → Completed (Paid)");
  } catch (err) {
    record(false, "Recycler status updates", err.message);
  }

  try {
    const s = await loginUser(QA.collector.email, QA.collector.password);
    localStorage.setItem("access_token", s.access_token);
    const handovers = await getHandovers();
    const own = handovers.find((x) => x.handover_id === handover.handover_id);
    const paid = handovers.filter((x) => String(x.payment_status || "").toLowerCase() === "paid")
      .reduce((t, x) => t + Number(x.estimated_value || 0), 0);
    record(own?.status === "Completed" && String(own?.payment_status).toLowerCase() === "paid", "Collector view: handover Completed & Paid");
    record(paid > 0, `Earnings ledger: total paid ₹${paid.toFixed(0)}`);
  } catch (err) {
    record(false, "Collector handovers/earnings", err.message);
  }

  try {
    const rec = await getHandoverRecord(handover.handover_id);
    record(Boolean(rec?.handover_id) && rec?.verification_status === "Verified", `Digital record: ${rec?.handover_id} (Verified)`);
  } catch (err) {
    record(false, "Digital handover record", err.message);
  }
}

await run();
const passed = results.filter((x) => x.ok).length;
console.log(`\nE2E smoke test: ${passed}/${results.length} checks passed\n`);
if (results.length - passed > 0) process.exit(1);
