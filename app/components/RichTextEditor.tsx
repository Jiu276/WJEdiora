'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button, Space } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder: _placeholder = '请输入内容...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 由单独的 Link 扩展提供，避免重复注册
        link: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    immediatelyRender: false, // 修复 SSR 问题
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('请输入图片 URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('请输入链接 URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
      {/* 工具栏 */}
      <div
        style={{
          borderBottom: '1px solid #d9d9d9',
          padding: '8px',
          background: '#fafafa',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space>
          <Button
            type={editor.isActive('bold') ? 'primary' : 'default'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="small"
          />
          <Button
            type={editor.isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="small"
          />
          <Button
            type={editor.isActive('strike') ? 'primary' : 'default'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            size="small"
          />
          <Button
            type={editor.isActive('bulletList') ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            size="small"
          />
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            size="small"
          />
          <Button
            icon={<LinkOutlined />}
            onClick={addLink}
            size="small"
          />
          <Button
            icon={<PictureOutlined />}
            onClick={addImage}
            size="small"
          />
        </Space>
      </div>

      {/* 编辑器内容区 */}
      <div style={{ minHeight: 300, maxHeight: 600, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 16px;
          min-height: 300px;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
        }
        .ProseMirror a {
          color: #1890ff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

