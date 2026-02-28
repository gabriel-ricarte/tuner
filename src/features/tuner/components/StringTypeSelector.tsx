import type { StringTypeId } from '@/shared/types/tuner';

type StringTypeSelectorText = {
  label: string;
  steel: string;
  nylon: string;
};

type StringTypeSelectorProps = {
  stringTypeId: StringTypeId;
  text: StringTypeSelectorText;
  onChange: (stringTypeId: StringTypeId) => void;
};

export function StringTypeSelector({
  stringTypeId,
  text,
  onChange,
}: StringTypeSelectorProps) {
  return (
    <section className="toolbar-group toolbar-group--strings">
      <span className="toolbar-label toolbar-label--sr">{text.label}</span>
      <div className="toolbar-toggle toolbar-toggle--dual" role="tablist" aria-label={text.label}>
        <button
          className={stringTypeId === 'steel' ? 'is-active' : ''}
          onClick={() => onChange('steel')}
          type="button"
        >
          {text.steel}
        </button>
        <button
          className={stringTypeId === 'nylon' ? 'is-active' : ''}
          onClick={() => onChange('nylon')}
          type="button"
        >
          {text.nylon}
        </button>
      </div>
    </section>
  );
}
