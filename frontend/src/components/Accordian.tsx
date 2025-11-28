import { useState } from "react";
import axios from "axios";
import CommentsList, { CommentType } from "./CommentsList";

interface AccordionProps {
  post_id: string;
  community_id: string;
}

const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

const Accordion: React.FC<AccordionProps> = ({ post_id, community_id }) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backend}/api/v1/c/${community_id}/posts/${post_id}/comments`
      );
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = () => {
    setOpen(!open);
    if (!open) fetchComments();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `${backend}/api/v1/c/${community_id}/posts/${post_id}/comments/`,
        { description: newComment }
      );

      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border p-4 rounded-lg my-2 bg-white shadow">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center font-semibold text-lg"
      >
        <span>💬 Comments</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 pl-2 border-t pt-3">
          {/* Add Comment */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={handleAddComment}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Post
            </button>
          </div>

          {loading ? (
            <p>Loading comments...</p>
          ) : (
            <CommentsList
              comments={comments}
              community_id={community_id}
              post_id={post_id}
              refresh={fetchComments}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Accordion;
