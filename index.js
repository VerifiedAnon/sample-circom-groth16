import {Circomkit} from 'circomkit';
import crypto from 'crypto';
import * as snarkjs from "snarkjs";
import path from "path";
import { buildBn128, utils } from "ffjavascript";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const { unstringifyBigInts } = utils;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

///////////////////////
// Compiling Circuit
/////////////////////// 
const circomkit = new Circomkit();

await circomkit.compile('nullifier', {
  file: 'circuit',
  template: 'ComputeNullifier',
  pubs: ["unsafeRandom"],
});

///////////////////////
// Proof Generation
///////////////////////
const wasmPath = path.join(__dirname, "build/nullifier/circuit_js", "circuit.wasm");
const zkeyPath = path.join(__dirname, "build/nullifier", "groth16_pkey.zkey");

const maxValue = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

let input = { "secret": getRandomBigInt(maxValue), "unsafeRandom": getRandomBigInt(maxValue) };
let { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

console.log(publicSignals)
console.log(proof)

let curve = await buildBn128();

let proofProc = unstringifyBigInts(proof);
publicSignals = unstringifyBigInts(publicSignals);
console.log("Public Signals: ", publicSignals);
let pi_a = g1Uncompressed(curve, proofProc.pi_a);
let pi_a_0_u8_array = Array.from(pi_a);
console.log(pi_a_0_u8_array);

const pi_b = g2Uncompressed(curve, proofProc.pi_b);
let pi_b_0_u8_array = Array.from(pi_b);
console.log(pi_b_0_u8_array.slice(0, 64));
console.log(pi_b_0_u8_array.slice(64, 128));

const pi_c = g1Uncompressed(curve, proofProc.pi_c);
let pi_c_0_u8_array = Array.from(pi_c);
console.log(pi_c_0_u8_array);

const publicSignal1 = to32ByteBuffer(publicSignals[0]);
let public_signal_0_u8_array = Array.from(publicSignal1);
console.log(public_signal_0_u8_array);

const publicSignal2 = to32ByteBuffer(publicSignals[1]);
let public_signal_1_u8_array = Array.from(publicSignal2);
console.log(public_signal_1_u8_array);

//////////////////////
// Helper Functions
/////////////////////
function g1Uncompressed(curve, p1Raw) {
  let p1 = curve.G1.fromObject(p1Raw);

  let buff = new Uint8Array(64);
  curve.G1.toRprUncompressed(buff, 0, p1);

  return Buffer.from(buff);
}
await snarkjs.groth16.verify()
function g2Uncompressed(curve, p2Raw) {
  let p2 = curve.G2.fromObject(p2Raw);

  let buff = new Uint8Array(128);
  curve.G2.toRprUncompressed(buff, 0, p2);

  return Buffer.from(buff);
}

function to32ByteBuffer(bigInt) {
  const hexString = bigInt.toString(16).padStart(64, '0'); 
  const buffer = Buffer.from(hexString, "hex");
  return buffer; 
}

function getRandomBigInt(max) {
    let rand = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ""));
    return rand % max;
}
