import {Circomkit} from 'circomkit';
import crypto from 'crypto';

const maxValue = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const circomkit = new Circomkit();

// artifacts output at `build/multiplier_3` directory
await circomkit.compile('nullifier', {
  file: 'circuit',
  template: 'ComputeNullifier',
  pubs: ["unsafeRandom"],
});

const secret = getRandomBigInt(maxValue);
const unsafeRandom = getRandomBigInt(maxValue);
// proof & public signals at `build/multiplier_3/my_input` directory
await circomkit.prove('nullifier', 'my_input', {"secret": secret, "unsafeRandom": unsafeRandom});

console.log("Generated proof");
// verify with proof & public signals at `build/multiplier_3/my_input`
//await circomkit.verify('nullifier', 'my_input');

function getRandomBigInt(max) {
    let rand = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ""));
    return rand % max;
}