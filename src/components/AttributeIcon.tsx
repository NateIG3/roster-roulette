import type { AttributeKey } from '../data/attributes';

// Hand-drawn-feel line icons (imperfect, single-weight strokes) instead of
// emoji, so they read as sketches rather than platform-specific glyphs.
const PATHS: Record<AttributeKey, JSX.Element> = {
  build: (
    <>
      <path d="M6 17c-1-3-.5-6 1.5-7.5C9 8.3 10 9 9.5 10.3c1.6-1.8 4-2.6 6-1.4 2.3 1.4 2.7 4 1.8 6.4-.6 1.7-2 3-3.8 3.2" />
      <path d="M7 16.5c1.8 1.6 4.3 2.2 6.2 1.4" />
    </>
  ),
  shooting: (
    <>
      <circle cx="12" cy="9.5" r="3.4" />
      <path d="M5 18.5c1.2-3 3.6-2.6 7-2.6s5.9-.4 7 2.6" />
      <path d="M8.5 9.8l-1.8-1.6M15.5 9.8l1.8-1.6" />
    </>
  ),
  handling: (
    <>
      <circle cx="12" cy="12.5" r="4.2" />
      <path d="M8.3 9.6c1.1-1.2 2.3-1.9 3.7-1.9M15.7 15.4c-1.1 1.2-2.3 1.9-3.7 1.9" />
      <path d="M4.5 12.5c1-.4 1.7-1 2-2M19.5 12.5c-1 .4-1.7 1-2 2" />
    </>
  ),
  defense: (
    <>
      <path d="M12 4.2c2 1.4 4 1.9 6 1.9 0 6.6-2.4 10.4-6 12.7-3.6-2.3-6-6.1-6-12.7 2 0 4-.5 6-1.9z" />
      <path d="M9.3 12l1.9 1.9 3.6-3.8" />
    </>
  ),
  playmaking: (
    <>
      <path d="M3.5 13c2.7-5.4 6-6.4 8.5-6.4s5.8 1 8.5 6.4c-2.7 5.4-6 6.4-8.5 6.4S6.2 18.4 3.5 13z" />
      <circle cx="12" cy="13" r="2.6" />
    </>
  ),
  rebounding: (
    <>
      <path d="M5 8.5h14" />
      <path d="M7.5 8.5v-1a1.6 1.6 0 013.2 0v1M13.3 8.5v-1a1.6 1.6 0 013.2 0v1" />
      <path d="M8 12.2l4 3.8 4-3.8" />
      <path d="M12 16v3.2" />
    </>
  ),
  clutch: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 8.8V13l3 2" />
      <path d="M9.5 3.5h5" />
    </>
  ),
  finishing: (
    <>
      <path d="M6 6.5h12l-1 4.8H7z" />
      <path d="M12 11.3v6" />
      <path d="M9 20c1-1.4 5-1.4 6 0" />
      <path d="M16.3 8L20 5.3" />
    </>
  ),
  athleticism: (
    <path d="M13 3.2L6.5 13.4h4.2l-1.7 7.4 7.5-11H12l1-6.6z" />
  ),
};

export default function AttributeIcon({ attribute }: { attribute: AttributeKey }) {
  return (
    <svg
      className="attribute-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[attribute]}
    </svg>
  );
}
