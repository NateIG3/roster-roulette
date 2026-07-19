import type { CSSProperties, ReactNode } from 'react';

interface ReelViewportProps<T> {
  spinning: boolean;
  sequence: T[];
  duration: number;
  onSettle: () => void;
  renderRow: (item: T) => ReactNode;
}

export default function ReelViewport<T>({ spinning, sequence, duration, onSettle, renderRow }: ReelViewportProps<T>) {
  if (!spinning) {
    return <div className="reel-box__row">{renderRow(sequence[0])}</div>;
  }

  const style = {
    '--reel-duration': `${duration}ms`,
    '--reel-count': sequence.length,
  } as CSSProperties;

  return (
    <div className="reel-box__viewport">
      <div className="reel-box__scroll" style={style} onAnimationEnd={onSettle}>
        {sequence.map((item, i) => (
          <div className="reel-box__row" key={i}>
            {renderRow(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
