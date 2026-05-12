// Static page background — a quiet vertical gradient, no motion.
//
// We had three iterations of an animated background here (drifting orbs,
// aurora mesh + 3D wireframe sphere, layered sine waves). The user
// asked for it removed, so the scene is now just the gradient base.
// Kept as a component (rather than inlined in Layout) so future
// changes don't need to touch every wrapper.

export function BackgroundScene() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%)",
      }}
    />
  );
}
