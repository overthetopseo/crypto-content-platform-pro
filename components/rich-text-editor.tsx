"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  Code2
} from "lucide-react"

import {
  Button,
  ButtonGroup,
  Separator,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Configure syntax highlighting
const lowlight = createLowlight()

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ 
  content = "", 
  onChange, 
  placeholder = "Start writing...", 
  className 
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Set content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleAddLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setIsLinkDialogOpen(false)
    }
  }

  const handleAddImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
      setIsImageDialogOpen(false)
    }
  }

  const handleInsertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const handleAddColumn = () => {
    editor?.chain().focus().addColumnAfter().run()
  }

  const handleDeleteColumn = () => {
    editor?.chain().focus().deleteColumn().run()
  }

  const handleAddRow = () => {
    editor?.chain().focus().addRowAfter().run()
  }

  const handleDeleteRow = () => {
    editor?.chain().focus().deleteRow().run()
  }

  const handleDeleteTable = () => {
    editor?.chain().focus().deleteTable().run()
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToggleGroup
            type="multiple"
            value={[
              editor.isActive('bold') ? 'bold' : '',
              editor.isActive('italic') ? 'italic' : '',
              editor.isActive('strike') ? 'strike' : '',
              editor.isActive('code') ? 'code' : '',
            ].filter(Boolean)}
          >
            <ToggleGroupItem
              value="bold"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="strike"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="code"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Headings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Heading1 className="h-4 w-4 mr-1" />
                Heading
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <span className="h-4 w-4 mr-2" />
                Paragraph
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </div>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Quote */}
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Code Block */}
          <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="h-4 w-4" />
          </Toggle>
        </div>

        {/* Second Row */}
        <div className="flex items-center gap-1 w-full">
          {/* Link */}
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-1" />
                Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddLink}>Add Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Image */}
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" />
                Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddImage}>Add Image</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Table */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <TableIcon className="h-4 w-4 mr-1" />
                Table
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleInsertTable}>
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
              {editor.isActive('table') && (
                <>
                  <DropdownMenuItem onClick={handleAddColumn}>
                    <span className="h-4 w-4 mr-2">|</span>
                    Add Column
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteColumn}>
                    <span className="h-4 w-4 mr-2">||</span>
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddRow}>
                    <span className="h-4 w-4 mr-2">—</span>
                    Add Row
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteRow}>
                    <span className="h-4 w-4 mr-2">=</span>
                    Delete Row
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteTable}>
                    <span className="h-4 w-4 mr-2">×</span>
                    Delete Table
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Highlight */}
          <Toggle
            size="sm"
            pressed={editor.isActive('highlight')}
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>

          <div className="flex-1" />

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[400px] focus-within:outline-none">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none focus:outline-none [&_.ProseMirror]:min-h-[350px]"
        />
      </div>

      {/* Character count (optional) */}
      <div className="border-t px-4 py-2 text-sm text-muted-foreground">
        {editor.storage.characterCount?.characters() || 0} characters
      </div>
    </div>
  )
}