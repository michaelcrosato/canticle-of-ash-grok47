declare module 'three' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    addScaledVector(v: Vector3, s: number): this;
    crossVectors(a: Vector3, b: Vector3): this;
    lengthSq(): number;
    normalize(): this;
    multiplyScalar(s: number): this;
  }
  export class Camera {
    rotation: { order: string; x: number; y: number };
    position: Vector3;
    aspect: number;
    updateMatrixWorld(force?: boolean): void;
    updateProjectionMatrix(): void;
    getWorldDirection(target: Vector3): Vector3;
    lookAt(x: number, y: number, z: number): void;
  }
  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
  }
  export class Scene {
    fog: FogExp2;
    add(obj: object): void;
  }
  export class Group {
    position: Vector3;
    visible: boolean;
    constructor();
    add(...obj: object[]): void;
    clear(): void;
  }
  export class Mesh {
    rotation: { x: number; y: number; z: number };
    position: Vector3;
    constructor(geometry?: object, material?: object);
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap: { enabled: boolean };
    constructor(params?: object);
    setPixelRatio(n: number): void;
    setClearColor(color: number | Color, alpha?: number): void;
    setSize(w: number, h: number, updateStyle?: boolean): void;
    render(scene: object, camera: object): void;
  }
  export class Color {
    constructor(color: number | string);
    copy(other: object): this;
    multiplyScalar(n: number): this;
    clone(): Color;
  }
  export class FogExp2 {
    color: Color;
    density: number;
    constructor(color: number, density: number);
  }
  export class PlaneGeometry {
    constructor(w?: number, h?: number);
  }
  export class BoxGeometry {
    constructor(w?: number, h?: number, d?: number);
  }
  export class ConeGeometry {
    constructor(r?: number, h?: number, s?: number);
  }
  export class CylinderGeometry {
    constructor(rt?: number, rb?: number, h?: number, s?: number);
  }
  export class SphereGeometry {
    constructor(r?: number, w?: number, h?: number);
  }
  export class MeshStandardMaterial {
    constructor(params?: object);
  }
  export class HemisphereLight {
    constructor(sky?: number, ground?: number, intensity?: number);
  }
  export class DirectionalLight {
    position: Vector3;
    constructor(color?: number, intensity?: number);
  }
  export class AmbientLight {
    constructor(color?: number, intensity?: number);
  }
}
