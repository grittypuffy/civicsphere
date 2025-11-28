import { CommentData } from "@/lib/types";
import { getComments, postComment, replyComment } from "@/lib/utils";
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Accordion as FluentAccordion,
  Input,
  Spinner,
  Tree,
  TreeItem,
  TreeItemLayout
} from "@fluentui/react-components";
import { ArrowReplyFilled, ChatRegular } from "@fluentui/react-icons";
import { atom, useAtom } from "jotai";
import { JSX, useCallback, useState } from "react";

interface AccordionProps {
  post_id: string;
  community_id: string;
}

const commentsAtom = atom<CommentData[]>([]);
const commentsLoadingAtom = atom<boolean>(false);
const accordionOpenAtom = atom<boolean>(false);

const Comments: React.FC<AccordionProps> = ({ post_id, community_id }) => {
  const [comments, setComments] = useAtom(commentsAtom);
  const [loading, setLoading] = useAtom(commentsLoadingAtom);
  const [open, setOpen] = useAtom(accordionOpenAtom);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const commentsData = await getComments(community_id, post_id);
      console.log('Fetched comments:', commentsData);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [community_id, post_id, setComments, setLoading]);

  const toggleAccordion = useCallback(() => {
    setOpen(!open);
    if (!open) {
      fetchComments();
    }
  }, [open, setOpen, fetchComments]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const requestBody = JSON.stringify({ description: newComment });
      await postComment(community_id, post_id, requestBody);
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsPosting(false);
    }
  }, [newComment, community_id, post_id, fetchComments]);

  const handleReplyComment = useCallback(async (commentId: string) => {
    const replyText = replyTexts[commentId] || "";
    if (!replyText.trim()) return;

    try {
      const requestBody = JSON.stringify({ description: replyText });
      await replyComment(community_id, post_id, commentId, requestBody);
      setReplyingTo(null);
      setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
      await fetchComments();
    } catch (err) {
      console.error('Failed to reply to comment:', err);
    }
  }, [replyTexts, community_id, post_id, fetchComments]);

  const toggleReply = useCallback((commentId: string) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo(commentId);
    }
    if (!replyTexts[commentId]) {
      setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
    }
  }, [replyingTo, replyTexts]);

  const handleReplyTextChange = useCallback((commentId: string, value: string) => {
    setReplyTexts(prev => ({
      ...prev, [commentId]: value
    }));
  }, []);

  const renderCommentTree = useCallback((comment: CommentData, isReply: boolean = false): JSX.Element => {
    return (
      <TreeItem key={comment.id} itemType={"leaf"}>
        <TreeItemLayout>
          <div className="w-full">
            <div className="flex flex-col items-start w-full p-2 gap-3">
              <div className="flex-1">
                <p className="text-sm mb-1">{comment.description}</p>
                <p className="text-xs italic text-gray-600">User: {comment.user_id}</p>
              </div>
              <div className={`${isReply ? 'hidden' : 'display'}`}>
                <Button
                  icon={<ArrowReplyFilled />}
                  size="small"
                  appearance="outline"
                  disabled={isReply}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReply(comment.id!);
                  }}
                  title="Reply to comment"
                >
                  Reply
                </Button>
              </div>
            </div>

            {replyingTo === comment.id && (
              <div className="mt-2 p-2 bg-gray-100 rounded" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyTexts[comment.id!] || ""}
                    onChange={(_, data) => handleReplyTextChange(comment.id!, data.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <Button
                    appearance="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplyComment(comment.id!);
                    }}
                  >
                    Reply
                  </Button>
                  <Button
                    appearance="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyingTo(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TreeItemLayout>

        {comment.comments && comment.comments.length > 0 && (
          <div className="ml-8 border-l">
            {comment.comments.map((childComment) => (
              renderCommentTree(childComment, true)
            ))}
          </div>
        )}
      </TreeItem>
    );
  }, [replyingTo, replyTexts, toggleReply, handleReplyComment, handleReplyTextChange]);

  return (
    <FluentAccordion>
      <AccordionItem value="comments">
        <AccordionHeader
          expandIcon={
            <ChatRegular />
          }
          onClick={toggleAccordion}
        >
          Comments
        </AccordionHeader>

        {open && (
          <AccordionPanel>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(_, data) => setNewComment(data.value)}
                className="flex-1"
              />
              <Button
                appearance="primary"
                onClick={handleAddComment}
                disabled={!newComment.trim() || isPosting}
              >
                {isPosting ? <Spinner size="tiny" /> : "Post"}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center p-4">
                <Spinner size="small" label="Loading comments..." />
              </div>
            ) : (
              <div className="w-full">
                <Tree>
                  {comments.map((comment) => renderCommentTree(comment))}
                </Tree>
              </div>
            )}
          </AccordionPanel>
        )}
      </AccordionItem>
    </FluentAccordion>
  );
};

export default Comments;
