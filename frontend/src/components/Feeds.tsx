'use client'

import Comments from "@/components/Comments"
import TTSButton from "@/components/TTSButton"
import { userIssueUpvotesAtom, userIssueUpvotesAtom_loadable, userPostDownvotesAtom, userPostDownvotesAtom_loadable, userPostUpvotesAtom, userPostUpvotesAtom_loadable } from "@/lib/store"
import { ExplainPostData, Issue, PostData } from "@/lib/types"
import { downvotePost, explainPost, removeDownvotePost, removeUpvoteIssue, removeUpvotePost, translatePost, upvoteIssue, upvotePost } from "@/lib/utils"
import { Badge, Button, Card, Spinner, Text, Tree, TreeItem, TreeItemLayout, TreeOpenChangeData, TreeOpenChangeEvent } from "@fluentui/react-components"
import { CheckmarkCircleColor, CheckmarkRegular, ChevronDownRegular, ChevronUpRegular, ClockRegular, Document16Regular, DocumentOnePageSparkleRegular, FlagFilled, HandRightRegular, InfoSparkleRegular, LocalLanguageFilled, Location16Filled, ThumbDislikeFilled, ThumbDislikeRegular, ThumbLikeFilled, TranslateFilled } from "@fluentui/react-icons"
import { ThumbLikeRegular } from "@fluentui/react-icons/svg/thumb-like"
import { useAtomValue, useSetAtom } from "jotai"
import { useTranslations } from 'next-intl'
import Image from "next/image"
import { useEffect, useState } from "react"

interface FeedsProps {
  posts?: PostData[]
  issues?: Issue[]
}

const PostCard = ({ post }: { post: PostData }) => {
  const t = useTranslations('feeds');
  const [isExpanded, setIsExpanded] = useState(false)
  const [postTitle, setPostTitle] = useState(post.title)
  const [postDescription, setPostDescription] = useState(post.description)
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [isDownvoted, setIsDownvoted] = useState(false)
  const upvotedPosts = useAtomValue(userPostUpvotesAtom_loadable)
  const downvotedPosts = useAtomValue(userPostDownvotesAtom_loadable)
  const setUpvotedPosts = useSetAtom(userPostUpvotesAtom)
  const setDownvotedPosts = useSetAtom(userPostDownvotesAtom)

  useEffect(() => {
    if (upvotedPosts.state === 'hasData') {
      setIsUpvoted(upvotedPosts.data.includes(post.post_id))
    }
    if (downvotedPosts.state === 'hasData') {
      setIsDownvoted(downvotedPosts.data.includes(post.post_id))
    }
  }, [post.post_id, upvotedPosts, downvotedPosts])

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isUpvoted) {
        await removeUpvotePost(post.community_id, post.post_id)
        setIsUpvoted(false)
        post.upvote = Math.max(0, post.upvote - 1)
        setUpvotedPosts(async (prev) => {
          const arr = await prev
          return [...arr.filter(id => id !== post.post_id)]
        })
      } else {
        await upvotePost(post.community_id, post.post_id)
        setIsUpvoted(true)
        setIsDownvoted(false)
        post.upvote = post.upvote + 1
        setUpvotedPosts(async (prev) => {
          const arr = await prev
          return [...arr, post.post_id]
        })
      }
    } catch (error) {
      console.error('Failed to handle upvote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownvote = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isDownvoted) {
        await removeDownvotePost(post.community_id, post.post_id)
        setIsDownvoted(false)
        post.downvote = Math.max(0, post.downvote - 1)
        setDownvotedPosts(async (prev) => {
          const arr = await prev
          return [...arr.filter(id => id !== post.post_id)]
        })
      } else {
        await downvotePost(post.community_id, post.post_id)
        setIsDownvoted(true)
        setIsUpvoted(false)
        post.downvote = post.downvote + 1
        setDownvotedPosts(async (prev) => {
          const arr = await prev
          return [...arr, post.post_id]
        })
      }
    } catch (error) {
      console.error('Failed to handle downvote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (translating) return;
    setTranslating(true);
    try {
      const response = await translatePost(post.community_id, post.post_id);
      setPostTitle(response?.title);
      setPostDescription(response?.description);
    } catch (error) {
      console.error('Failed to translate post:', error);
    } finally {
      setTranslating(false);
    }
  };

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

  const [explainMessage, setExplainMessage] = useState<ExplainPostData>({
    summary: "",
    whats_in_it_for_me: "",
  })
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false)

  const handleOpenChange = async (_e: TreeOpenChangeEvent, data: TreeOpenChangeData) => {
    if (data.type === 'Click' && data.open && explainMessage.summary === "") {
      setIsLoadingExplanation(true)
      try {
        const res = await explainPost(post.community_id, post.post_id)
        if (!res) {
          setExplainMessage({
            summary: t('noExplanation'),
            whats_in_it_for_me: "",
          })
          return
        }
        setExplainMessage(res)
      } catch (error) {
        console.error('Error in Tree onOpenChange:', error);
        setExplainMessage({
          summary: t('failedExplanation'),
          whats_in_it_for_me: "",
        })
      } finally {
        setIsLoadingExplanation(false)
      }
    }
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <Card
      key={post.post_id}
      className={`w-full shadow-sm hover:shadow-md transition-all duration-200 ${isExpanded ? 'shadow-lg' : ''}`}
    >
      <div className="p-3">
        <div className="space-y-2">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <h3
              className="text-lg font-semibold text-gray-900 flex-1 hover:text-blue-600 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {postTitle}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <Badge
                appearance="filled"
                color={getVerifiedBadgeColor(post.verified)}
                size="medium"
                icon={post.verified === 'True' ? <CheckmarkCircleColor /> : <CheckmarkRegular />}
              >
                {post.verified === "True" ? t('verified') : post.verified === "False" ? t('unverified') : t('pending')}
              </Badge>
              {post.flagged && (
                <Badge
                  appearance="filled"
                  color="danger"
                  size="medium"
                  icon={<FlagFilled />}
                >
                  {t('flagged')}
                </Badge>
              )}
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ClockRegular />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Location16Filled />
              <span>{post.location}</span>
            </div>
            <Badge appearance="ghost" size="small">
              <div className="flex items-center space-x-1 px-1">
                <LocalLanguageFilled />
                <span className="text-xs">{post.lang.toUpperCase()}</span>
              </div>
            </Badge>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} appearance="tint" size="medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description - Collapsed/Expanded */}
          <div className="py-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              {isExpanded ? postDescription : truncateText(postDescription)}
            </p>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3">
              {/* Action Buttons when expanded */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleTranslate}
                  disabled={translating}
                  appearance="secondary"
                  icon={<TranslateFilled aria-hidden="true" />}
                  size="small"
                >
                  {translating ? (
                    <>
                      <Spinner size={"tiny"} /> Translating
                    </>
                  ) : (
                    "Translate"
                  )}
                </Button>
                <TTSButton text={`Title: ${postTitle}. Description: ${postDescription}`}></TTSButton>
              </div>

              {/* Links */}
              {post.url.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Text size={300} className="text-gray-600 font-medium">{t('links')}</Text>
                  <div className="flex flex-wrap gap-2">
                    {post.url.map((link, index) => {
                      const lastPart = new URL(link).pathname.split('/').filter(Boolean).pop();
                      return (<Button
                        key={index}
                        as="a"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        appearance="outline"
                        size="small"
                        icon={<Document16Regular />}
                      >
                        {lastPart || ''}
                      </Button>)
                    })}
                  </div>
                </div>
              )}

              {/* Explanation Tree */}
              <Tree onOpenChange={handleOpenChange} size="medium">
                <TreeItem itemType="branch">
                  <TreeItemLayout
                    expandIcon={<DocumentOnePageSparkleRegular />}
                  >
                    {t('explain')}
                  </TreeItemLayout>
                  <Tree size="medium">
                    <TreeItem itemType="leaf">
                      <TreeItemLayout>
                        {isLoadingExplanation ? (
                          <div className="w-full">
                            <p>{t('loadingExplanation')}</p>
                          </div>
                        ) : explainMessage.summary ? (
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-700">{explainMessage.summary}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{t('clickToLoadExplanation')}</span>
                        )}
                      </TreeItemLayout>
                    </TreeItem>
                    {explainMessage.whats_in_it_for_me && (
                      <TreeItem itemType="branch">
                        <TreeItemLayout
                          expandIcon={<InfoSparkleRegular />}
                        >
                          {t('whatsInItForMe')}
                        </TreeItemLayout>
                        <Tree>
                          <TreeItem itemType="leaf">
                            <TreeItemLayout>
                              <span className="text-sm text-gray-600">{explainMessage.whats_in_it_for_me}</span>
                            </TreeItemLayout>
                          </TreeItem>
                        </Tree>
                      </TreeItem>
                    )}
                  </Tree>
                </TreeItem>
              </Tree>

              {/* Comments Accordion */}
              <div>
                <Comments post_id={post.post_id} community_id={post.community_id} />
              </div>
            </div>
          )}

          {/* Voting and Show More/Less Button */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              appearance="transparent"
              size="small"
              icon={isExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? t('showLess') : t('showMore')}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                appearance={isUpvoted ? "primary" : "secondary"}
                size="small"
                icon={isUpvoted ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
                disabled={loading || isDownvoted}
                onClick={handleUpvote}
              >
                {post.upvote}
              </Button>
              <Button
                appearance={isDownvoted ? "primary" : "secondary"}
                size="small"
                icon={isDownvoted ? <ThumbDislikeFilled /> : <ThumbDislikeRegular />}
                disabled={loading || isUpvoted}
                onClick={handleDownvote}
              >
                {post.downvote}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

const IssueCard = ({ issue }: { issue: Issue }) => {
  const t = useTranslations('feeds');
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUpvoted, setIsUpvoted] = useState(false)
  const upvotedIssues = useAtomValue(userIssueUpvotesAtom_loadable)
  const setUpvotedIssues = useSetAtom(userIssueUpvotesAtom)

  useEffect(() => {
    if (upvotedIssues.state === 'hasData') {
      setIsUpvoted(upvotedIssues.data?.includes(issue.issue_id))
    }
  }, [issue.issue_id, upvotedIssues])

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isUpvoted) {
        await removeUpvoteIssue(issue.community_id, issue.issue_id)
        setIsUpvoted(false)
        issue.upvote = Math.max(0, issue.upvote - 1)
        setUpvotedIssues(async (prev) => {
          const arr = await prev
          return [...arr.filter(id => id !== issue.issue_id)]
        })
      } else {
        await upvoteIssue(issue.community_id, issue.issue_id)
        setIsUpvoted(true)
        issue.upvote = issue.upvote + 1
        setUpvotedIssues(async (prev) => {
          const arr = await prev
          return [...arr, issue.issue_id]
        })
      }
    } catch (error) {
      console.error('Failed to handle issue upvote:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "success"
      case "in_progress": return "warning"
      case "open": return "informative"
      default: return "subtle"
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <Card
      key={issue.issue_id}
      className={`w-full shadow-sm hover:shadow-md transition-all duration-200 ${isExpanded ? 'shadow-lg' : ''}`}
    >
      <div className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3
              className="text-lg font-semibold text-gray-900 flex-1 hover:text-blue-600 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {issue.title}
            </h3>
            <Badge
              appearance="filled"
              color={getStatusBadgeColor(issue.status)}
              size="medium"
              icon={<HandRightRegular />}
            >
              {issue.status}
            </Badge>
          </div>

          {/* Meta Information */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ClockRegular />
              <span>{formatDate(issue.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{t('issueId')} {issue.issue_id}</span>
            </div>
          </div>

          {/* Description */}
          <div className="py-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              {isExpanded ? issue.description : truncateText(issue.description)}
            </p>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3 border-t pt-3">
              <TTSButton text={t('ttsIssue', { title: issue.title, description: issue.description })}></TTSButton>
            </div>
          )}

          {/* Show More/Less and Voting */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              appearance="transparent"
              size="small"
              icon={isExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? t('showLess') : t('showMore')}
            </Button>

            <Button
              appearance={isUpvoted ? "primary" : "secondary"}
              size="small"
              icon={isUpvoted ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
              disabled={loading}
              onClick={handleUpvote}
            >
              {issue.upvote}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const Feeds = ({ posts, issues }: FeedsProps) => {
  const t = useTranslations('feeds');

  const hasAnyContent = (posts && posts.length > 0) || (issues && issues.length > 0)

  if (!hasAnyContent) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12 min-h-[50vh]">
          <Image
            src="/images/no_data.svg"
            alt={t('noDataAlt')}
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
          <Text size={400} className="text-gray-500">
            {t('nothingHere')}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid gap-4">
        {posts?.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
          />
        ))}

        {issues?.map((issue) => (
          <IssueCard
            key={issue.issue_id}
            issue={issue}
          />
        ))}
      </div>
    </div>
  )
}
