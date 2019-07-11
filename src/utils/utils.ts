export function random(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRect(element: Element): any {
  return element.getBoundingClientRect();
}

export function hasValueChanged(oldRect, newRect, key: string): boolean {
  let rectChanged = false;

  if (newRect[key] !== oldRect[key]) {
    rectChanged = true;
  }

  return rectChanged;
}
