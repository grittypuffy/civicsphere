import { PostData } from "@/lib/types"
import { Badge, Button, Card, CardFooter, CardHeader, Text } from "@fluentui/react-components"
import { CheckmarkCircleColor, CheckmarkRegular, ClockRegular, FlagFilled, LocalLanguageFilled, Location16Filled, ThumbDislikeRegular } from "@fluentui/react-icons"
import { ThumbLikeRegular } from "@fluentui/react-icons/svg/thumb-like"

const localPostData: PostData[] = [
  {
    community_id: "comm_001",
    post_id: "post_001",
    user_id: "user_001",
    tag_id: ["tech", "programming"],
    upvote: 42,
    downvote: 3,
    title: "Getting Started with React Development",
    description: "A comprehensive guide to building modern web applications with React and TypeScript. Learn the fundamentals and best practices.",
    url: ["https://example.com/react-guide"],
    lang: "en",
    location: "San Francisco, CA",
    verified: "True",
    flagged: false,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    community_id: "comm_002",
    post_id: "post_002",
    user_id: "user_002",
    tag_id: ["design", "ui/ux"],
    upvote: 28,
    downvote: 1,
    title: "Modern UI Design Principles",
    description: "Exploring the latest trends in user interface design and how to create engaging user experiences.",
    url: ["https://example.com/ui-design"],
    lang: "en",
    location: "New York, NY",
    verified: "Not Sure",
    flagged: false,
    created_at: "2024-01-14T14:20:00Z"
  },
  {
    community_id: "comm_003",
    post_id: "post_003",
    user_id: "user_003",
    tag_id: ["javascript", "performance"],
    upvote: 35,
    downvote: 2,
    title: "Optimizing JavaScript Performance",
    description: "Learn advanced techniques for improving JavaScript performance in web applications, including memory management and code optimization.",
    url: ["https://example.com/js-performance"],
    lang: "en",
    location: "Austin, TX",
    verified: "True",
    flagged: false,
    created_at: "2024-01-13T09:15:00Z"
  },
  {
    community_id: "comm_004",
    post_id: "post_004",
    user_id: "user_004",
    tag_id: ["data", "analytics"],
    upvote: 19,
    downvote: 5,
    title: "Data Visualization Best Practices",
    description: "A deep dive into creating effective data visualizations that tell compelling stories and drive business decisions.",
    url: ["https://example.com/data-viz", "https://example.com/charts-guide"],
    lang: "en",
    location: "Seattle, WA",
    verified: "False",
    flagged: true,
    created_at: "2024-01-12T16:45:00Z"
  },
  {
    community_id: "comm_005",
    post_id: "post_005",
    user_id: "user_005",
    tag_id: ["mobile", "development", "ios"],
    upvote: 24,
    downvote: 0,
    title: "Building Native iOS Apps with Swift",
    description: "Complete tutorial series covering iOS development from basics to advanced concepts, including SwiftUI and networking.",
    url: [],
    lang: "en",
    location: "Los Angeles, CA",
    verified: "Not Sure",
    flagged: false,
    created_at: "2024-01-11T11:30:00Z"
  }
]

export const Feeds = ({ posts }: { posts?: PostData[] }) => {
  const displayPosts = posts ? posts : localPostData

  const getVerifiedBadgeColor = (verified: string) => {
    switch (verified) {
      case "True": return "success"
      case "False": return "danger"
      default: return "warning"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid gap-6">
        {displayPosts.map((post) => (
          <Card key={post.post_id} className="w-full shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader
              header={
                <div className="space-y-2 w-full p-3">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">{post.title}</h2>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge
                        appearance="filled"
                        color={getVerifiedBadgeColor(post.verified)}
                        size="medium"
                        icon={post.verified === 'True' ? <CheckmarkCircleColor /> : <CheckmarkRegular />}
                      >
                        {post.verified === "True" ? "Verified" : post.verified === "False" ? "Unverified" : "Pending"}
                      </Badge>
                      {post.flagged && (
                        <Badge
                          appearance="filled"
                          color="danger"
                          size="medium"
                          icon={<FlagFilled />}
                        >
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.tag_id.map((tag, index) => (
                      <Badge key={index} appearance="tint" size="medium">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              }
              description={
                <div className="space-y-3 px-3 w-full">
                  <div className="flex gap-2">
                    <Badge appearance="ghost" size="small">
                      <div className="flex items-center space-x-1 px-1">
                        <LocalLanguageFilled />
                        <span className="text-xs">{post.lang.toUpperCase()}</span>
                      </div>
                    </Badge>
                    <Badge appearance="ghost" size="small">
                      <div className="flex items-center space-x-1 px-1">
                        <ClockRegular />
                        <span className="text-xs">{formatDate(post.created_at)}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="py-1">
                    <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>
                    {post.url.length > 0 && (
                      <div className="space-y-1">
                        <Text size={200} className="text-gray-600 font-medium">Links:</Text>
                        {post.url.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:text-blue-800 text-sm truncate underline"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <hr />
                </div>
              }
            />
            <CardFooter>
              <div className="flex items-center justify-between w-full px-3">
                <div className="flex items-center space-x-2">
                  <Location16Filled />
                  <span className="text-md text-gray-500">
                    {post.location}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    appearance="subtle"
                    size="medium"
                    icon={<ThumbLikeRegular />}
                    className="text-green-600 hover:text-green-700"
                  >
                    {post.upvote}
                  </Button>
                  <Button
                    appearance="subtle"
                    size="medium"
                    icon={<ThumbDislikeRegular />}
                    className="text-red-600 hover:text-red-700"
                  >
                    {post.downvote}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {displayPosts.length === 0 && (
        <div className="text-center py-12">
          <Text size={400} className="text-gray-500">No posts available</Text>
        </div>
      )}
    </div>
  )
}
