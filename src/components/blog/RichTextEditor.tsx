'use client';

import React, { useRef, useState, useCallback } from 'react';
import { theme } from '@/lib/design-system';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  onImageUpload
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format text
  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert image
  const insertImage = useCallback(async (file: File) => {
    if (!onImageUpload) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      
      // Insert image at cursor position
      const img = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 16px 0;" />`;
      document.execCommand('insertHTML', false, img);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload, onChange]);

  // Handle image file selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertImage(file);
    }
  }, [insertImage]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      insertImage(file);
    }
  }, [insertImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Initialize content
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-text-editor border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 rounded hover:bg-gray-200 font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 rounded hover:bg-gray-200 italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-3 py-1 rounded hover:bg-gray-200 underline"
          title="Underline"
        >
          U
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Headings */}
        <select
          onChange={(e) => formatText('formatBlock', e.target.value)}
          className="px-2 py-1 rounded border hover:bg-gray-200"
          defaultValue=""
        >
          <option value="" disabled>Heading</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="p">Paragraph</option>
        </select>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Lists */}
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Links and images */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) formatText('createLink', url);
          }}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Insert Image"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : '🖼️ Image'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Alignment */}
        <button
          type="button"
          onClick={() => formatText('justifyLeft')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Align Left"
        >
          ⬅️
        </button>
        <button
          type="button"
          onClick={() => formatText('justifyCenter')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Align Center"
        >
          ↔️
        </button>
        <button
          type="button"
          onClick={() => formatText('justifyRight')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Align Right"
        >
          ➡️
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Other */}
        <button
          type="button"
          onClick={() => formatText('removeFormat')}
          className="px-3 py-1 rounded hover:bg-gray-200"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="min-h-[400px] p-4 focus:outline-none"
        style={{
          lineHeight: '1.6',
          fontSize: '16px'
        }}
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        
        .rich-text-editor [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .rich-text-editor [contenteditable] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        
        .rich-text-editor [contenteditable] p {
          margin: 1em 0;
        }
        
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor [contenteditable] a {
          color: ${theme.colors.primary};
          text-decoration: underline;
        }
        
        .rich-text-editor [contenteditable] img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
}