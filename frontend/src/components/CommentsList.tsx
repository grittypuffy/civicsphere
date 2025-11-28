import { useState } from "react";
import axios from "axios";

export interface CommentType {
  id?: string;
  user_id: string;
  description: string;
  flagged?: boolean;
  comments?: CommentType[];
}

interface Props {
  comments: CommentType[];
  community_id: string;
  post_id: string;
  refresh: () => void;
}

const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

const CommentsList: React.FC<Props> = ({
  comments,
  community_id,
  post_id,
  refresh,
}) => {
  return (
    <div className="space-y-4">
      {comments.map((c, index) => (
        <CommentItem
          key={c.id || `nested-${index}`}
          comment={c}
          community_id={community_id}
          post_id={post_id}
          refresh={refresh}
        />
      ))}
    </div>
  );
};

interface ItemProps {
  comment: CommentType;
  community_id: string;
  post_id: string;
  refresh: () => void;
}

const CommentItem: React.FC<ItemProps> = ({
  comment,
  community_id,
  post_id,
  refresh,
}) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await axios.post(
        `${backend}/api/v1/c/${community_id}/posts/${post_id}/comments/${comment.id}/reply`,
        { description: replyText }
      );

      setReplyText("");
      setReplying(false);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border rounded p-3 bg-gray-50">
      <p className="font-semibold">👤 {comment.user_id}</p>
      <p className="ml-2">{comment.description}</p>

      {/* Reply button */}
      <button
        className="text-blue-600 text-sm mt-2"
        onClick={() => setReplying(!replying)}
      >
        Reply 💬
      </button>

      {replying && (
        <div className="flex gap-2 my-2">
          <input
            type="text"
            placeholder="Write a reply..."
            className="flex-1 border px-2 py-1 rounded"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            onClick={handleReply}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Send
          </button>
        </div>
      )}

      {/* Render Nested Comments */}
      {(comment.comments?.length ?? 0) > 0 && (
        <div className="ml-6 mt-3 border-l pl-3">
          <CommentsList
            comments={comment.comments!}
            community_id={community_id}
            post_id={post_id}
            refresh={refresh}
          />
        </div>
      )}
    </div>
  );
};

export default CommentsList;
