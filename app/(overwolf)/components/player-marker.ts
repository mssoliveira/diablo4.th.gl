import leaflet from "leaflet";

export type PlayerPosition = {
  location: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
};

const SCALE = 0.083492;
const DEG_45 = Math.PI / 4; // 45 degrees in radians
const OFFSET = {
  x: 113.2,
  y: -227.4,
};
const normalizePoint = ({ x, y }: { x: number; y: number }) => {
  const scaledX = x * SCALE;
  const scaledY = y * SCALE;
  const rotatedX = scaledX * Math.cos(DEG_45) - scaledY * Math.sin(DEG_45);
  const rotatedY = scaledX * Math.sin(DEG_45) + scaledY * Math.cos(DEG_45);
  return [(-rotatedY + OFFSET.y) / 1.65, (-rotatedX + OFFSET.x) / 1.65] as [
    number,
    number
  ];
};

export default class PlayerMarker extends leaflet.Marker {
  declare rotation: number;
  private _icon: HTMLElement | undefined = undefined;

  _setPos(pos: leaflet.Point): void {
    if (!this._icon) {
      return;
    }
    if (this._icon.style.transform) {
      this._icon.style.transition = "transform 1s linear";
    }

    this._icon.style.transformOrigin = "center";
    this._icon.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) rotate(${this.rotation}deg)`;
    return;
  }

  updatePosition({ location, rotation }: PlayerPosition) {
    let playerRotation = 90 - rotation;

    const oldRotation = this.rotation || playerRotation;

    let spins = 0;
    if (oldRotation >= 180) {
      spins += Math.floor(Math.abs(oldRotation + 180) / 360);
    } else if (oldRotation <= -180) {
      spins -= Math.floor(Math.abs(oldRotation - 180) / 360);
    }
    playerRotation += 360 * spins;
    if (oldRotation - playerRotation >= 180) {
      playerRotation += 360;
    } else if (playerRotation - oldRotation >= 180) {
      playerRotation -= 360;
    }

    this.rotation = playerRotation;

    this.setLatLng(normalizePoint(location));
  }
}
