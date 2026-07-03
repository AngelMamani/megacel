import { useEffect, useRef, useCallback } from 'react';

interface ProductRichTextEditorProps {
  Id: string;
  Value: string;
  OnChange: (html: string) => void;
  Placeholder?: string;
  MinHeight?: number;
}

const FontOptions = [
  { label: 'Predeterminada', value: '' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Times New Roman', value: 'Times New Roman' },
];

const FontSizeOptions = [
  { label: 'Pequeño', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Mediano', value: '4' },
  { label: 'Grande', value: '5' },
  { label: 'Muy grande', value: '6' },
];

const ExecFormat = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export const ProductRichTextEditor = ({
  Id,
  Value,
  OnChange,
  Placeholder = 'Escribe la descripción completa del producto...',
  MinHeight = 160,
}: ProductRichTextEditorProps) => {
  const EditorRef = useRef<HTMLDivElement>(null);
  const IsInternalChange = useRef(false);

  const SyncEditorContent = useCallback(() => {
    const editor = EditorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== Value) {
      editor.innerHTML = Value || '';
    }
  }, [Value]);

  useEffect(() => {
    if (!IsInternalChange.current) {
      SyncEditorContent();
    }
    IsInternalChange.current = false;
  }, [SyncEditorContent]);

  const HandleInput = () => {
    const html = EditorRef.current?.innerHTML || '';
    IsInternalChange.current = true;
    OnChange(html);
  };

  const HandleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const RunCommand = (command: string, value?: string) => {
    EditorRef.current?.focus();
    ExecFormat(command, value);
    HandleInput();
  };

  const HandleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    if (font) {
      RunCommand('fontName', font);
    } else {
      RunCommand('removeFormat');
    }
    e.target.value = '';
  };

  const HandleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    RunCommand('fontSize', e.target.value);
    e.target.value = '3';
  };

  const IsEmpty = !Value || Value === '<br>' || Value.replace(/<[^>]*>/g, '').trim() === '';

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formato de descripción">
        <div className="rich-text-editor__group" role="group" aria-label="Estilo de texto">
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Negrita"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Cursiva"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Subrayado"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('underline')}
          >
            <span className="rich-text-editor__underline">U</span>
          </button>
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Tachado"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('strikeThrough')}
          >
            <s>S</s>
          </button>
        </div>

        <div className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group" role="group" aria-label="Listas">
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Viñetas"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('insertUnorderedList')}
          >
            • Lista
          </button>
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Lista numerada"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('insertOrderedList')}
          >
            1. Lista
          </button>
        </div>

        <div className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group" role="group" aria-label="Tipografía">
          <select
            className="rich-text-editor__select"
            defaultValue=""
            onChange={HandleFontChange}
            onMouseDown={HandleToolbarMouseDown}
            title="Tipo de letra"
            aria-label="Tipo de letra"
          >
            {FontOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="rich-text-editor__select"
            defaultValue="3"
            onChange={HandleFontSizeChange}
            onMouseDown={HandleToolbarMouseDown}
            title="Tamaño de letra"
            aria-label="Tamaño de letra"
          >
            {FontSizeOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group" role="group" aria-label="Párrafo">
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Título"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('formatBlock', 'h3')}
          >
            Título
          </button>
          <button
            type="button"
            className="rich-text-editor__btn"
            title="Cita"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('formatBlock', 'blockquote')}
          >
            Cita
          </button>
          <button
            type="button"
            className="rich-text-editor__btn rich-text-editor__btn--muted"
            title="Quitar formato"
            onMouseDown={HandleToolbarMouseDown}
            onClick={() => RunCommand('removeFormat')}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div
        ref={EditorRef}
        id={Id}
        className={`rich-text-editor__content${IsEmpty ? ' is-empty' : ''}`}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Descripción completa"
        data-placeholder={Placeholder}
        style={{ minHeight: MinHeight }}
        onInput={HandleInput}
        onBlur={HandleInput}
        suppressContentEditableWarning
      />
    </div>
  );
};

export const NormalizeDescriptionHtml = (html: string): string => {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<br>' || trimmed === '<div><br></div>') return '';
  return trimmed;
};

export const StripHtmlTags = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
