import { Camera, Vector3 } from 'three';

const UP = new Vector3(0, 1, 0);
const _fwd = new Vector3();
const _right = new Vector3();

/**
 * Camera-relative movement. The only place a move vector is built.
 * right = forward × up. yaw 0 (camera default) looks down -Z, and right is +X.
 */
export function moveVectorFromCamera(
  camera: Camera,
  input: { forward: number; strafe: number },
  target: Vector3,
): Vector3 {
  camera.updateMatrixWorld();
  camera.getWorldDirection(_fwd);
  _fwd.y = 0;
  if (_fwd.lengthSq() < 1e-8) _fwd.set(0, 0, -1);
  else _fwd.normalize();
  _right.crossVectors(_fwd, UP);
  if (_right.lengthSq() < 1e-8) _right.set(1, 0, 0);
  else _right.normalize();
  target.set(0, 0, 0);
  target.addScaledVector(_fwd, input.forward);
  target.addScaledVector(_right, input.strafe);
  return target;
}

export function clampPitch(pitch: number): number {
  const limit = Math.PI / 2 - 0.05;
  return Math.max(-limit, Math.min(limit, pitch));
}
