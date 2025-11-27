'use client'

import TTSButton from "@/components/TTSButton"
import { userIssueUpvotesAtom, userIssueUpvotesAtom_loadable, userPostDownvotesAtom, userPostDownvotesAtom_loadable, userPostUpvotesAtom, userPostUpvotesAtom_loadable } from "@/lib/store"
import { ExplainPostData, Issue, PostData } from "@/lib/types"
import { downvotePost, explainPost, getUserIssueUpvotes, getUserPostDownvotes, getUserPostUpvotes, removeDownvotePost, removeUpvoteIssue, removeUpvotePost, translatePost, upvoteIssue, upvotePost } from "@/lib/utils"
import { Badge, Button, Card, CardFooter, CardHeader, Dialog, DialogActions, DialogBody, DialogSurface, DialogTitle, Spinner, Text, Tree, TreeItem, TreeItemLayout, TreeOpenChangeData, TreeOpenChangeEvent } from "@fluentui/react-components"
import { CheckmarkCircleColor, CheckmarkRegular, ClockRegular, DocumentOnePageSparkleRegular, EyeRegular, FlagFilled, HandRightRegular, InfoSparkleRegular, LocalLanguageFilled, Location16Filled, ThumbDislikeFilled, ThumbDislikeRegular, ThumbLikeFilled, TranslateFilled } from "@fluentui/react-icons"
import { ThumbLikeRegular } from "@fluentui/react-icons/svg/thumb-like"
import { useAtomValue, useSetAtom } from "jotai"
import { useTranslations } from 'next-intl'
import Image from "next/image"
import { useState } from "react"

interface FeedsProps {
  posts?: PostData[]
  issues?: Issue[]
  showVoted?: boolean
}

const PostDetailDialog = ({ post, open, setOpen }: { post: PostData, open: boolean, setOpen: (open: boolean) => void }) => {
  const t = useTranslations('feeds');
  const upvotedPosts = useAtomValue(userPostUpvotesAtom_loadable)
  const downvotedPosts = useAtomValue(userPostDownvotesAtom_loadable)
  const setPostUpvotes = useSetAtom(userPostUpvotesAtom)
  const setPostDownvotes = useSetAtom(userPostDownvotesAtom)
  const [postTitle, setPostTitle] = useState(post.title)
  const [postDescription, setPostDescription] = useState(post.description)
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const upvotedPostIds = upvotedPosts.state === 'hasData' ? upvotedPosts.data as string[] : []
  const downvotedPostIds = downvotedPosts.state === 'hasData' ? downvotedPosts.data as string[] : []
  const isUpvoted = upvotedPostIds?.includes(post.post_id)
  const isDownvoted = downvotedPostIds?.includes(post.post_id)

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isUpvoted) {
        await removeUpvotePost(post.community_id, post.post_id)
      } else {
        await upvotePost(post.community_id, post.post_id)
      }
      setPostUpvotes(getUserPostUpvotes())
      setPostDownvotes(getUserPostDownvotes())
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
      } else {
        await downvotePost(post.community_id, post.post_id)
      }
      setPostUpvotes(getUserPostUpvotes())
      setPostDownvotes(getUserPostDownvotes())
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

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
      <DialogSurface className="max-w-4xl">
        <DialogTitle>{post.title}</DialogTitle>
        <DialogBody>
          <Card className="w-full shadow-md">
            <CardHeader
              header={
                <div className="space-y-2 w-full p-3">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">{postTitle}</h2>
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

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
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
                    <p className="text-gray-600 text-sm leading-relaxed">{postDescription}</p>
                    {post.url.length > 0 && (
                      <div className="space-y-1">
                        <Text size={200} className="text-gray-600 font-medium">{t('links')}</Text>
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
                    appearance={isUpvoted ? "primary" : "subtle"}
                    size="medium"
                    icon={isUpvoted ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
                    className={isUpvoted ? "text-green-700" : "text-green-600 hover:text-green-700"}
                    disabled={loading}
                    onClick={handleUpvote}
                  >
                    {post.upvote}
                  </Button>
                  <Button
                    appearance={isDownvoted ? "primary" : "subtle"}
                    size="medium"
                    icon={isDownvoted ? <ThumbDislikeFilled /> : <ThumbDislikeRegular />}
                    className={isDownvoted ? "text-red-700" : "text-red-600 hover:text-red-700"}
                    disabled={loading}
                    onClick={handleDownvote}
                  >
                    {post.downvote}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </DialogBody>
        <DialogActions>
          <Button
            onClick={handleTranslate}
            disabled={translating}
            appearance="primary"
            icon={<TranslateFilled aria-hidden="true" />}
            aria-label="Translate post"
          >
            {translating ? (
              <>
                <Spinner size={"small"} /> Translating
              </>
            ) : (
              "Translate"
            )}
          </Button>
          <TTSButton text={`Title: ${postTitle}. Description: ${postDescription}`}></TTSButton>
          <Button appearance="secondary" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  )
}


const PostCard = ({ post }: { post: PostData }) => {
  const t = useTranslations('feeds');
  const upvotedPosts = useAtomValue(userPostUpvotesAtom_loadable)
  const downvotedPosts = useAtomValue(userPostDownvotesAtom_loadable)
  const [dialogOpen, setDialogOpen] = useState(false)

  const upvotedPostIds = upvotedPosts.state === 'hasData' ? upvotedPosts.data as string[] : []
  const downvotedPostIds = downvotedPosts.state === 'hasData' ? downvotedPosts.data as string[] : []

  const isUpvoted = upvotedPostIds?.includes(post.post_id)
  const isDownvoted = downvotedPostIds?.includes(post.post_id)

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
            summary: "No explanation available",
            whats_in_it_for_me: "",
          })
          return
        }
        setExplainMessage(res)
      } catch (error) {
        console.error('Error in Tree onOpenChange:', error);
        setExplainMessage({
          summary: "Failed to load explanation",
          whats_in_it_for_me: "",
        })
      } finally {
        setIsLoadingExplanation(false)
      }
    }
  }

  return (
    <>
      <Card
        key={post.post_id}
        className={`w-full shadow-sm hover:shadow-md transition-shadow duration-200 ${(isUpvoted || isDownvoted) ? 'bg-blue-50 border-blue-200' : ''}`}
      >
        <div className="p-3">
          <div className="flex items-center justify-between p-1">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                onClick={() => setDialogOpen(true)}>
                {post.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockRegular />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Location16Filled />
                  <span>{post.location}</span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <Button
                appearance="outline"
                size="medium"
                icon={<EyeRegular />}
                onClick={() => setDialogOpen(true)}
              >
                {t('view')}
              </Button>
            </div>
          </div>
          <Tree onOpenChange={handleOpenChange} size="medium">
            <TreeItem itemType="branch">
              <TreeItemLayout
                expandIcon={<DocumentOnePageSparkleRegular />}
              >
                Explain
              </TreeItemLayout>
              <Tree size="medium">
                <TreeItem itemType="leaf">
                  <TreeItemLayout>
                    {isLoadingExplanation ? (
                      <div className="w-full">
                        <p>Loading...</p>
                      </div>
                    ) : explainMessage.summary ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-700">{explainMessage.summary}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Click to load explanation...</span>
                    )}
                  </TreeItemLayout>
                </TreeItem>
                {explainMessage.whats_in_it_for_me && (
                  <TreeItem itemType="branch">
                    <TreeItemLayout
                      expandIcon={<InfoSparkleRegular />}
                    >
                      Whats in it for me
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
        </div>
      </Card>

      <PostDetailDialog
        post={post}
        open={dialogOpen}
        setOpen={setDialogOpen}
      />
    </>
  )
}

const IssueDetailDialog = ({ issue, open, setOpen }: { issue: Issue, open: boolean, setOpen: (open: boolean) => void }) => {
  const t = useTranslations('feeds');
  const upvotedIssues = useAtomValue(userIssueUpvotesAtom_loadable)
  const setIssueUpvotes = useSetAtom(userIssueUpvotesAtom)
  const [loading, setLoading] = useState(false)

  const upvotedIssueIds = upvotedIssues.state === 'hasData' ? upvotedIssues.data as string[] : []
  const isUpvoted = upvotedIssueIds?.includes(issue.issue_id)

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isUpvoted) {
        await removeUpvoteIssue(issue.community_id, issue.issue_id)
      } else {
        await upvoteIssue(issue.community_id, issue.issue_id)
      }
      setIssueUpvotes(getUserIssueUpvotes())
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

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
      <DialogSurface className="max-w-4xl">
        <DialogTitle>{issue.title}</DialogTitle>
        <DialogBody>
          <Card className="w-full shadow-md">
            <CardHeader
              header={
                <div className="space-y-2 w-full p-3">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">{issue.title}</h2>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge
                        appearance="filled"
                        color={getStatusBadgeColor(issue.status)}
                        size="medium"
                        icon={<HandRightRegular />}
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              }
              description={
                <div className="space-y-3 px-3 w-full">
                  <div className="flex gap-2">
                    <Badge appearance="ghost" size="small">
                      <div className="flex items-center space-x-1 px-1">
                        <ClockRegular />
                        <span className="text-xs">{formatDate(issue.created_at)}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="py-1">
                    <p className="text-gray-600 text-sm leading-relaxed">{issue.description}</p>
                  </div>
                  <hr />
                </div>
              }
            />
            <CardFooter>
              <div className="flex items-center justify-between w-full px-3">
                <div className="flex items-center space-x-2">
                  <span className="text-md text-gray-500">
                    {t('issueId')} {issue.issue_id}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    appearance={isUpvoted ? "primary" : "subtle"}
                    size="medium"
                    icon={isUpvoted ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
                    className={isUpvoted ? "text-green-700" : "text-green-600 hover:text-green-700"}
                    disabled={loading}
                    onClick={handleUpvote}
                  >
                    {issue.upvote}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  )
}

const IssueCard = ({ issue }: { issue: Issue }) => {
  const t = useTranslations('feeds');
  const upvotedIssues = useAtomValue(userIssueUpvotesAtom_loadable)
  const [dialogOpen, setDialogOpen] = useState(false)

  const upvotedIssueIds = upvotedIssues.state === 'hasData' ? upvotedIssues.data as string[] : []
  const isUpvoted = upvotedIssueIds?.includes(issue.issue_id)

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
    <>
      <Card
        key={issue.issue_id}
        className={`w-full shadow-sm hover:shadow-md transition-shadow duration-200 ${isUpvoted ? 'bg-orange-50 border-orange-200' : ''}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                onClick={() => setDialogOpen(true)}>
                {issue.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockRegular />
                  <span>{formatDate(issue.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{t('issueId')} {issue.issue_id}</span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <Button
                appearance="outline"
                size="medium"
                icon={<EyeRegular />}
                onClick={() => setDialogOpen(true)}
              >
                {t('view')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <IssueDetailDialog
        issue={issue}
        open={dialogOpen}
        setOpen={setDialogOpen}
      />
    </>
  )
}

export const Feeds = ({ posts, issues, showVoted }: FeedsProps) => {
  const t = useTranslations('feeds');
  const upvotedPosts = useAtomValue(userPostUpvotesAtom_loadable)
  const downvotedPosts = useAtomValue(userPostDownvotesAtom_loadable)
  const upvotedIssues = useAtomValue(userIssueUpvotesAtom_loadable)
  const upvotedPostIds = upvotedPosts.state === 'hasData' ? new Set(upvotedPosts.data as string[]) : new Set()
  const downvotedPostIds = downvotedPosts.state === 'hasData' ? new Set(downvotedPosts.data as string[]) : new Set()
  const upvotedIssueIds = upvotedIssues.state === 'hasData' ? new Set(upvotedIssues.data as string[]) : new Set()

  const votedPostIds = new Set([...upvotedPostIds, ...downvotedPostIds])

  const filteredPosts = posts?.filter(post =>
    showVoted ? votedPostIds.has(post.post_id) : !votedPostIds.has(post.post_id)
  ) || []

  const filteredIssues = issues?.filter(issue =>
    showVoted ? upvotedIssueIds.has(issue.issue_id) : !upvotedIssueIds.has(issue.issue_id)
  ) || []

  // Use the filtered arrays for content presence checks to avoid reading properties of undefined
  const hasAnyContent = (filteredPosts.length > 0) || (filteredIssues.length > 0)

  if (!hasAnyContent) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12 min-h-[50vh]">
          <Image
            src="/images/no_data.svg"
            alt="No Data"
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
          <Text size={400} className="text-gray-500">
            {showVoted ? t('noVotedContent') : t('nothingHere')}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
          />
        ))}

        {filteredIssues.map((issue) => (
          <IssueCard
            key={issue.issue_id}
            issue={issue}
          />
        ))}
      </div>
    </div>
  )
}
