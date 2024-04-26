import { Buffer } from "buffer";

const divider = 32768.0;

export interface SensorData {
  acceleration: Coordinates;
  angularVelocity: Coordinates;
  corners: Coordinates;
  magneticField: Coordinates;
}

interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export function extractDataFromRaw(raw: Uint8Array): SensorData {
  const length = raw.length;
  let accelerationDecoded: number[] = [];
  let angularVelocityDecoded: number[] = [];
  let cornersDecoded: number[] = [];
  let magneticFieldDecoded: number[] = [];
  let decoded: number[] = [];

  for (let i = 2; i < length; i = i + 2) {
    let buffer = Buffer.from(raw.slice(i, i + 2));
    decoded = decoded.concat(buffer.readInt16LE(0));
  }

  console.log("Decoded array:", decoded);

  for (let i = 0; i < 9; i++) {
    // Extract acceleration, angular velocity, and corners data
    if (i < 3) {
      accelerationDecoded.push(decoded[i]);
    } else if (i < 6) {
      angularVelocityDecoded.push(decoded[i]);
    } else {
      cornersDecoded.push(decoded[i]);
    }
  }

  // Extract magnetic field data
  for (let i = 6; i < 9; i++) {
    magneticFieldDecoded.push(decoded[i]);
  }

  console.log("Magnetic Field Decoded:", magneticFieldDecoded);

  // Calculate acceleration values
  const Ax = (accelerationDecoded[0] / divider) * 16;
  const Ay = (accelerationDecoded[1] / divider) * 16;
  const Az = (accelerationDecoded[2] / divider) * 16;

  // Calculate angular velocity values
  const Gx = (angularVelocityDecoded[0] / divider) * 2000;
  const Gy = (angularVelocityDecoded[1] / divider) * 2000;
  const Gz = (angularVelocityDecoded[2] / divider) * 2000;

  // Calculate corners values
  const AngX = (cornersDecoded[0] / divider) * 180;
  const AngY = (cornersDecoded[1] / divider) * 180;
  const AngZ = (cornersDecoded[2] / divider) * 180;

  // Calculate magnetic field values
  const Hx = getSignInt16((magneticFieldDecoded[1] << 8) | magneticFieldDecoded[0]) / 120;
  const Hy = getSignInt16((magneticFieldDecoded[3] << 8) | magneticFieldDecoded[2]) / 120;
  const Hz = getSignInt16((magneticFieldDecoded[5] << 8) | magneticFieldDecoded[4]) / 120;

  return {
    acceleration: { x: Ax, y: Ay, z: Az },
    angularVelocity: { x: Gx, y: Gy, z: Gz },
    corners: { x: AngX, y: AngY, z: AngZ },
    magneticField: { x: Hx, y: Hy, z: Hz },
  };
}

// Function to get signed int16 value
function getSignInt16(num: number): number {
  if (num >= 32768) {
    num -= 65536;
  }
  return num;
}
