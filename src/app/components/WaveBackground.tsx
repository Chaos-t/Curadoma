export function WaveBackground() {
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
