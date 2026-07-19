function initials(name: string): string {
  const clean = name.replace(/\s*\(.*?\)\s*/g, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerAvatar({ name }: { name: string }) {
  return (
    <span className="player-avatar" aria-hidden="true">
      {initials(name)}
    </span>
  );
}
