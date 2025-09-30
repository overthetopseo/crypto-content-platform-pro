"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  Save,
  Send,
  Eye,
  Calendar,
  ArrowLeft,
  Plus,
  X,
  Clock,
  CheckCircle,
  Archive,
  AlertCircle,
  Edit
} from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RichTextEditor } from "@/components/rich-text-editor"
import { generateSlug, generateUniqueSlug } from "@/lib/slug"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().optional(),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  customSchema: z.string().optional(),
  openGraphTitle: z.string().optional(),
  openGraphDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

// Query client
const queryClient = new QueryClient()

// Auto-save hook
function useAutoSave(data: Partial<FormData>, interval: number = 30000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!data.title && !data.content) return

    const timer = setTimeout(async () => {
      if (data.title || data.content) {
        setIsSaving(true)
        try {
          // Save to localStorage for drafts
          localStorage.setItem('post-draft', JSON.stringify({
            ...data,
            savedAt: new Date().toISOString()
          }))
          setLastSaved(new Date())
          toast.info('Draft saved automatically')
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }
    }, interval)

    return () => clearTimeout(timer)
  }, [data, interval])

  return { lastSaved, isSaving }
}

// Main component
function CreatePostInner() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTags, setNewTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "DRAFT",
      categoryId: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      customSchema: "",
      openGraphTitle: "",
      openGraphDescription: "",
      openGraphImage: "",
    },
  })

  const watchedValues = form.watch()
  const { lastSaved, isSaving } = useAutoSave(watchedValues)

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('post-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        if (draft.title || draft.content) {
          form.reset(draft)
          toast.info('Draft restored from local storage')
        }
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [form])

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
  })

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      return response.json()
    },
  })

  // Generate slug from title
  const generateSlugFromTitle = async (title: string) => {
    if (title) {
      const slug = await generateUniqueSlug(title)
      form.setValue('slug', slug)
    }
  }

  // Handle title change
  const handleTitleChange = (title: string) => {
    form.setValue('title', title)
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('title'))) {
      generateSlugFromTitle(title)
    }
  }

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (data: FormData) => {
      const postData = {
        ...data,
        tagIds: selectedTags,
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Post created successfully!')
      localStorage.removeItem('post-draft')
      router.push(`/content/${data.id}/edit`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post')
    },
  })

  // Save draft mutation
  const saveDraft = useMutation({
    mutationFn: async (data: FormData) => {
      const postData = {
        ...data,
        status: "DRAFT" as const,
        tagIds: selectedTags,
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Draft saved successfully!')
      localStorage.removeItem('post-draft')
      router.push(`/content/${data.id}/edit`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save draft')
    },
  })

  // Submit form
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await createPost.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save as draft
  const handleSaveDraft = async () => {
    const currentData = form.getValues()
    if (currentData.title || currentData.content) {
      setIsSubmitting(true)
      try {
        await saveDraft.mutateAsync(currentData)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      toast.error('Please add a title or content before saving')
    }
  }

  // Schedule post
  const handleSchedulePost = async () => {
    const currentData = form.getValues()
    if (currentData.publishedAt) {
      const scheduleData = { ...currentData, status: "SCHEDULED" as const }
      setIsSubmitting(true)
      try {
        await createPost.mutateAsync(scheduleData)
        setIsScheduleDialogOpen(false)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      toast.error('Please select a publish date')
    }
  }

  // Add new tag
  const handleAddTag = () => {
    if (newTagName.trim()) {
      setNewTags([...newTags, newTagName.trim()])
      setNewTagName("")
    }
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Status colors and icons
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'DRAFT':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Edit }
      case 'SCHEDULED':
        return { color: 'bg-blue-100 text-blue-800', icon: Calendar }
      case 'ARCHIVED':
        return { color: 'bg-gray-100 text-gray-800', icon: Archive }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock }
    }
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
            <p className="text-muted-foreground">
              Write and publish your content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              {isSaving ? 'Saving...' : `Last saved: ${format(lastSaved, 'MMM d, h:mm a')}`}
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting || saveDraft.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Post</DialogTitle>
                <DialogDescription>
                  Choose when you want this post to be published.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString() : "")
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSchedulePost} disabled={!form.getValues('publishedAt')}>
                  Schedule Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || createPost.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Add the main content for your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your post title..."
                          {...field}
                          onChange={(e) => handleTitleChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="url-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in the post URL: /blog/{form.getValues('slug')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your post..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary that will appear in post previews and search results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing your post..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="PUBLISHED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Published
                          </div>
                        </SelectItem>
                        <SelectItem value="SCHEDULED">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Scheduled
                          </div>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Archived
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing tags */}
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* Add new tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* New tags preview */}
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setNewTags(newTags.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO title (60 chars max)"
                        {...field}
                        maxLength={60}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use the post title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SEO description (160 chars max)"
                        className="resize-none"
                        {...field}
                        maxLength={160}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use the excerpt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/canonical-url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            <h1>{form.getValues('title') || 'Untitled Post'}</h1>
            {form.getValues('excerpt') && (
              <p className="lead">{form.getValues('excerpt')}</p>
            )}
            <div 
              dangerouslySetInnerHTML={{ 
                __html: form.getValues('content') || '<p>Start writing to see preview...</p>' 
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export wrapped component with QueryClient
export default function CreatePost() {
  return (
    <QueryClientProvider client={queryClient}>
      <CreatePostInner />
    </QueryClientProvider>
  )
}