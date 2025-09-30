'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
// import { useState } from 'react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ 
  content: _ = '', 
  onChange, 
  placeholder = 'Escribe tu descripción...',
  className = ''
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className}`,
        placeholder,
      },
    },
  })

  const addImage = () => {
    const url = window.prompt('URL de la imagen:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('URL del enlace:')
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run()
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          <strong>B</strong>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          <em>I</em>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('strike') ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          H1
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          H2
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          • Lista
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
        >
          1. Lista
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Media */}
        <button
          onClick={addImage}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200"
        >
          🖼️ Imagen
        </button>
        
        <button
          onClick={addLink}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200"
        >
          🔗 Enlace
        </button>
        
        {editor.isActive('link') && (
          <button
            onClick={removeLink}
            className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200"
          >
            🔗 Quitar
          </button>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Actions */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          ↶
        </button>
        
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          ↷
        </button>
      </div>

      {/* Editor */}
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        {editor.storage.characterCount?.characters() || 0} caracteres
      </div>
    </div>
  )
}
