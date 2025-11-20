# TODO: Implement POST /post Endpoint

## Steps to Complete

- [x] Create models/db/community.py with Community model (community_id: str, community_name: str)
- [x] Update models/api/post.py: Modify CreatePostRequest to remove community_id, lang, location
- [ ] Implement routers/community.py: Add create_post function for POST /post endpoint
- [x] Test the endpoint for correct insertion and error handling
