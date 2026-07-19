import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS, type AttributeKey } from '../data/attributes';
import { useReelSpin } from '../hooks/useReelSpin';
import AttributeIcon from './AttributeIcon';
import ReelViewport from './ReelViewport';

interface AttributeReelBoxProps {
  attribute: AttributeKey;
  spinToken: string;
  respinnable: boolean;
  onRespin: () => void;
  valuePreview?: number;
}

export default function AttributeReelBox({
  attribute,
  spinToken,
  respinnable,
  onRespin,
  valuePreview,
}: AttributeReelBoxProps) {
  const { spinning, sequence, duration, settle } = useReelSpin<AttributeKey>(attribute, spinToken, ATTRIBUTE_KEYS);

  return (
    <button
      type="button"
      className={`reel-box reel-box--attribute${spinning ? ' is-spinning' : ''}${respinnable ? '' : ' is-locked'}`}
      onClick={() => respinnable && onRespin()}
    >
      {respinnable && (
        <span className="reel-box__respin-hint" aria-hidden="true">
          ↻
        </span>
      )}
      <ReelViewport
        spinning={spinning}
        sequence={sequence}
        duration={duration}
        onSettle={settle}
        renderRow={(attr) => (
          <>
            <AttributeIcon attribute={attr} />
            <span className="reel-box__label">{ATTRIBUTE_LABELS[attr]}</span>
          </>
        )}
      />
      {!spinning && valuePreview !== undefined && <span className="reel-box__value">{valuePreview}</span>}
    </button>
  );
}
