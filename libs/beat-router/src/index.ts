interface BeatElement {
  tag: string;
  key: string;
  props?: unknown;
}

type BeatComponent = <T>(props?: T) => (BeatElement | BeatElement[] | null);

type Beat = BeatElement | BeatComponent;

const beats: Beat[] = [
]
