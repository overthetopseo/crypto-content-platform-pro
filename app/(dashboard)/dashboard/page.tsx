"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { 
  FileText,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  Plus,
  Edit,
  Search
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { format } from "date-fns"

// Query client
const queryClient = new QueryClient()

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  scheduledPosts: number
  totalViews: number
  thisMonthViews: number
  totalComments: number
  newComments: number
}

interface RecentPost {
  id: string
  title: string
  slug: string
  status: string
  createdAt: string
  publishedAt?: string
  category?: {
    name: string
  }
}

// Main component
function DashboardInner() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Fetch posts data
      const postsResponse = await fetch('/api/posts?limit=1000')
      if (!postsResponse.ok) throw new Error('Failed to fetch posts')
      const postsData = await postsResponse.json()
      
      const posts = postsData.posts || []
      
      // Calculate stats
      const totalPosts = posts.length
      const publishedPosts = posts.filter((p: any) => p.status === 'PUBLISHED').length
      const draftPosts = posts.filter((p: any) => p.status === 'DRAFT').length
      const scheduledPosts = posts.filter((p: any) => p.status === 'SCHEDULED').length
      
      // Mock analytics data (would come from analytics API)
      const totalViews = Math.floor(Math.random() * 10000) + 1000
      const thisMonthViews = Math.floor(Math.random() * 1000) + 100
      const totalComments = Math.floor(Math.random() * 500) + 50
      const newComments = Math.floor(Math.random() * 10) + 1
      
      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalViews,
        thisMonthViews,
        totalComments,
        newComments,
      }
    },
  })

  // Fetch recent posts
  const { data: recentPostsData, isLoading: isLoadingRecent } = useQuery<{ posts: RecentPost[] }>({
    queryKey: ['recentPosts'],
    queryFn: async () => {
      const response = await fetch('/api/posts?limit=5')
      if (!response.ok) throw new Error('Failed to fetch recent posts')
      return response.json()
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="h-3 w-3" />
      case 'DRAFT':
        return <Edit className="h-3 w-3" />
      case 'SCHEDULED':
        return <Calendar className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your crypto content platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/content/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.publishedPosts || 0} published
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.thisMonthViews || 0} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.newComments || 0} new
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalViews && stats?.totalViews > 0 
                    ? Math.round((stats.totalComments / stats.totalViews) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Comment rate
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>
              Your latest content updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPostsData?.posts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first crypto content post.
                </p>
                <Link href="/content/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPostsData?.posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(post.status)}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(post.status)}
                            {post.status}
                          </div>
                        </Badge>
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category.name}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/content/${post.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/content">
                    <Button variant="outline" className="w-full">
                      View All Posts
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/content/new">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Post
              </Button>
            </Link>
            
            <Link href="/content?status=DRAFT">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                Edit Drafts
                {stats?.draftPosts && stats.draftPosts > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {stats.draftPosts}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/content?status=SCHEDULED">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Scheduled Posts
                {stats?.scheduledPosts && stats.scheduledPosts > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {stats.scheduledPosts}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Manage Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export wrapped component with QueryClient
export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardInner />
    </QueryClientProvider>
  )
}