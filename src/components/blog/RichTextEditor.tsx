'use client';

import React, { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  theme?: any;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  onImageUpload,
  placeholder = "Start writing...",
  theme 
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      const imageMarkdown = `\n![Image](${imageUrl})\n`;
      const textarea = textareaRef.current;
      
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const newValue = value.slice(0, cursorPosition) + imageMarkdown + value.slice(cursorPosition);
        onChange(newValue);
        
        // Set cursor position after the inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition + imageMarkdown.length, cursorPosition + imageMarkdown.length);
        }, 0);
      } else {
        onChange(value + imageMarkdown);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Insert formatting at cursor position
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    
    const newValue = value.slice(0, start) + before + selectedText + after + value.slice(end);
    onChange(newValue);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Toolbar buttons data
  const toolbarButtons = [
    { icon: '𝐁', action: () => insertFormatting('**', '**'), title: 'Bold' },
    { icon: '𝐼', action: () => insertFormatting('*', '*'), title: 'Italic' },
    { icon: 'H₁', action: () => insertFormatting('# '), title: 'Heading 1' },
    { icon: 'H₂', action: () => insertFormatting('## '), title: 'Heading 2' },
    { icon: '•', action: () => insertFormatting('- '), title: 'Bullet List' },
    { icon: '1.', action: () => insertFormatting('1. '), title: 'Numbered List' },
    { icon: '""', action: () => insertFormatting('> '), title: 'Quote' },
    { icon: '</>', action: () => insertFormatting('`', '`'), title: 'Inline Code' },
    { icon: '{ }', action: () => insertFormatting('```\n', '\n```'), title: 'Code Block' },
    { icon: '🔗', action: () => insertFormatting('[Link Text](', ')'), title: 'Link' },
  ];

  return (
    <div 
      className="border rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: theme?.nestedBg || theme?.cardBg || 'white',
        borderColor: theme?.border || '#e5e7eb'
      }}
    >
      {/* Toolbar */}
      <div 
        className="flex items-center gap-1 p-3 border-b flex-wrap"
        style={{ 
          backgroundColor: theme?.bg || '#f9fafb',
          borderColor: theme?.border || '#e5e7eb'
        }}
      >
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
            style={{ 
              color: theme?.text?.primary || '#1f2937',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme?.nestedBg || '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={button.title}
          >
            {button.icon}
          </button>
        ))}
        
        <div className="w-px h-6 mx-2" style={{ backgroundColor: theme?.border || '#e5e7eb' }} />
        
        {/* Image Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !onImageUpload}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            color: theme?.text?.primary || '#1f2937'
          }}
          onMouseEnter={(e) => {
            if (!isUploading && onImageUpload) {
              e.currentTarget.style.backgroundColor = theme?.nestedBg || '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Upload Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 p-4 resize-none border-none outline-none"
          style={{ 
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            backgroundColor: theme?.nestedBg || theme?.cardBg || 'white',
            color: theme?.text?.primary || '#1f2937'
          }}
        />
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div className="px-4 py-2 rounded-lg shadow-lg" style={{ backgroundColor: theme?.cardBg || 'white' }}>
              <span className="text-sm font-medium" style={{ color: theme?.text?.primary || '#1f2937' }}>⏳ Uploading image...</span>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="px-4 py-3 text-xs border-t" style={{ 
        backgroundColor: theme?.bg || '#f9fafb',
        borderColor: theme?.border || '#e5e7eb',
        color: theme?.text?.secondary || '#6b7280'
      }}>
        💡 <strong>Tip:</strong> Use Markdown formatting. Select text and click buttons to format, or type manually.
        {onImageUpload && ' Click 🖼️ to upload images.'}
      </div>
    </div>
  );
}

export { RichTextEditor };