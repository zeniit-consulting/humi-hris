import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Redo,
    RemoveFormatting,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface WysiwygEditorProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    className?: string;
    disabled?: boolean;
}

export function WysiwygEditor({
    id,
    value,
    onChange,
    placeholder = 'Tuliskan detail di sini...',
    minHeight = 'min-h-[140px]',
    className,
    disabled = false,
}: WysiwygEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const isEmpty = editor.isEmpty;
            onChange(isEmpty ? '' : editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;
        const currentHtml = editor.isEmpty ? '' : editor.getHTML();
        if ((value || '') !== currentHtml) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [disabled, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div
            id={id}
            className={cn(
                'group flex flex-col rounded-md border border-input bg-transparent shadow-xs transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
                disabled && 'opacity-60 cursor-not-allowed',
                className,
            )}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-input/60 bg-muted/30 px-2 py-1.5 text-muted-foreground">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('bold') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Tebal (Ctrl+B)"
                    aria-label="Bold"
                >
                    <Bold className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('italic') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Miring (Ctrl+I)"
                    aria-label="Italic"
                >
                    <Italic className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('underline') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Garis Bawah (Ctrl+U)"
                    aria-label="Underline"
                >
                    <UnderlineIcon className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('strike') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Coret"
                    aria-label="Strike"
                >
                    <Strikethrough className="size-3.5" />
                </button>

                <div className="mx-1 h-4 w-px bg-border/60" />

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('heading', { level: 2 }) &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Judul Bagian (H2)"
                    aria-label="Heading 2"
                >
                    <Heading2 className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('heading', { level: 3 }) &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Sub-judul (H3)"
                    aria-label="Heading 3"
                >
                    <Heading3 className="size-3.5" />
                </button>

                <div className="mx-1 h-4 w-px bg-border/60" />

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('bulletList') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Daftar Poin"
                    aria-label="Bullet List"
                >
                    <List className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground',
                        editor.isActive('orderedList') &&
                            'bg-muted font-bold text-foreground shadow-2xs',
                    )}
                    title="Daftar Nomor"
                    aria-label="Numbered List"
                >
                    <ListOrdered className="size-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                    disabled={disabled}
                    className="flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground"
                    title="Hapus Format"
                    aria-label="Clear formatting"
                >
                    <RemoveFormatting className="size-3.5" />
                </button>

                <div className="ml-auto flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={disabled || !editor.can().undo()}
                        className="flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Batal (Ctrl+Z)"
                        aria-label="Undo"
                    >
                        <Undo className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={disabled || !editor.can().redo()}
                        className="flex size-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Ulangi (Ctrl+Y)"
                        aria-label="Redo"
                    >
                        <Redo className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Editable Content */}
            <EditorContent
                editor={editor}
                className={cn(
                    'p-3 text-sm focus:outline-none',
                    minHeight,
                    // ProseMirror inner container styles
                    '[&_.tiptap]:outline-none [&_.tiptap]:min-h-full',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/60 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
                    '[&_.tiptap_p]:my-1.5 [&_.tiptap_p:first-child]:mt-0 [&_.tiptap_p:last-child]:mb-0',
                    '[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:my-2',
                    '[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:my-2',
                    '[&_.tiptap_li]:my-1 [&_.tiptap_li_p]:my-0.5',
                    '[&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-3 [&_.tiptap_h2]:mb-1',
                    '[&_.tiptap_h3]:text-sm [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-2.5 [&_.tiptap_h3]:mb-1',
                    '[&_.tiptap_strong]:font-semibold',
                    '[&_.tiptap_u]:underline',
                    '[&_.tiptap_s]:line-through',
                )}
            />
        </div>
    );
}
