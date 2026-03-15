package backend.post.service;

import backend.community.domain.Community;
import backend.community.repository.CommunityRepository;
import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import backend.post.domain.Comment;
import backend.post.domain.Post;
import backend.post.domain.Vote;
import backend.post.dto.*;
import backend.post.repository.CommentRepository;
import backend.post.repository.PostRepository;
import backend.post.repository.VoteRepository;
import backend.user.domain.User;
import backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    public Page<PostResponse> findAll(int page, int size, String sort) {
        if ("hot".equals(sort) || "top".equals(sort)) {
            return postRepository.findAllOrderByUpvotes(PageRequest.of(page, size))
                    .map(PostResponse::from);
        }
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findAll(pageRequest).map(PostResponse::from);
    }

    public PostResponse findById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse create(CreatePostRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId()).orElse(null);
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .community(community)
                .build();
        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse vote(Long postId, String voteType, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        Vote.VoteType type = Vote.VoteType.valueOf(voteType.toUpperCase());
        Optional<Vote> existingVote = voteRepository.findByUserIdAndPostId(user.getId(), postId);

        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getVoteType() == type) {
                throw new BusinessException(ErrorCode.DUPLICATE_VOTE);
            }
            if (type == Vote.VoteType.UP) {
                post.upvote();
                post.cancelDownvote();
            } else {
                post.downvote();
                post.cancelUpvote();
            }
            vote.changeVoteType(type);
        } else {
            Vote vote = Vote.builder().user(user).post(post).voteType(type).build();
            voteRepository.save(vote);
            if (type == Vote.VoteType.UP) post.upvote();
            else post.downvote();
        }
        return PostResponse.from(post);
    }

    public List<CommentResponse> findComments(Long postId) {
        return commentRepository.findByPostIdAndParentCommentIsNull(postId)
                .stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(Long postId, CreateCommentRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId()).orElse(null);
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .parentComment(parentComment)
                .build();
        return CommentResponse.from(commentRepository.save(comment));
    }
}
