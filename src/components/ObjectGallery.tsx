import { SceneObject } from '../lesson/SceneObject';
import { ART } from '../lesson/art';
import type { ObjectKind } from '../lesson/types';

/** #/objects — every scene object, for contributors choosing the right illustration. */
export function ObjectGallery() {
  return (
    <main className="card gallery" aria-label="Scene objects">
      <h1>Scene objects</h1>
      <p className="muted">Every object kind a lesson can use. Pick the one that looks like the real thing.</p>
      <div className="gallery__grid">
        {(Object.keys(ART) as ObjectKind[]).map((k) => <div key={k} className="gallery__cell"><SceneObject kind={k} label={k} state="done" /></div>)}
      </div>
    </main>
  );
}
