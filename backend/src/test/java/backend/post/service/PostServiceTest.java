package backend.post.service;

import backend.community.repository.CommunityRepository;
import backend.global.exception.BusinessException;
import backend.post.domain.Post;
import backend.post.domain.Vote;
import backend.post.dto.CreatePostRequest;
import backend.post.dto.PostResponse;
import backend.post.repository.CommentRepository;
import backend.post.repository.PostRepository;
import backend.post.repository.VoteRepository;
import backend.user.domain.AuthProvider;
import backend.user.domain.Role;
import backend.user.domain.User;
import backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private VoteRepository voteRepository;
    @Mock private UserRepository userRepository;
    @Mock private CommunityRepository communityRepository;

    @InjectMocks
    private PostService postService;

    private User createUser(Long id, String email, String nickname) {
        User user = User.builder()
                .email(email)
                .nickname(nickname)
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    @Test
    @DisplayName("게시물 생성 성공")
    void createPost() {
        // given
        User author = createUser(1L, "test@example.com", "테스터");

        CreatePostRequest request = new CreatePostRequest();
        ReflectionTestUtils.setField(request, "title", "테스트 제목");
        ReflectionTestUtils.setField(request, "content", "테스트 내용");
        ReflectionTestUtils.setField(request, "communityId", null);

        Post post = Post.builder()
                .title("테스트 제목")
                .content("테스트 내용")
                .author(author)
                .build();
        ReflectionTestUtils.setField(post, "id", 1L);

        given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(author));
        given(postRepository.save(any(Post.class))).willReturn(post);

        // when
        PostResponse response = postService.create(request, "test@example.com");

        // then
        assertThat(response.getTitle()).isEqualTo("테스트 제목");
        assertThat(response.getContent()).isEqualTo("테스트 내용");
        assertThat(response.getAuthorNickname()).isEqualTo("테스터");
    }

    @Test
    @DisplayName("최신순 게시물 목록 조회 성공")
    void findAllPosts() {
        // given
        User author = createUser(1L, "test@example.com", "테스터");
        Post post = Post.builder().title("제목").content("내용").author(author).build();
        Page<Post> postPage = new PageImpl<>(List.of(post));

        given(postRepository.findAll(any(Pageable.class))).willReturn(postPage);

        // when
        Page<PostResponse> result = postService.findAll(0, 10, "latest");

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("제목");
    }

    @Test
    @DisplayName("업보트 성공 — upvotes 1 증가")
    void upvotePost() {
        // given
        User voter = createUser(1L, "voter@example.com", "투표자");
        User author = createUser(2L, "author@example.com", "작성자");
        Post post = Post.builder().title("제목").content("내용").author(author).build();
        ReflectionTestUtils.setField(post, "id", 1L);

        given(userRepository.findByEmail("voter@example.com")).willReturn(Optional.of(voter));
        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(voteRepository.findByUserIdAndPostId(1L, 1L)).willReturn(Optional.empty());
        given(voteRepository.save(any(Vote.class))).willAnswer(inv -> inv.getArgument(0));

        // when
        PostResponse response = postService.vote(1L, "UP", "voter@example.com");

        // then
        assertThat(response.getUpvotes()).isEqualTo(1);
    }

    @Test
    @DisplayName("다운보트 성공 — downvotes 1 증가")
    void downvotePost() {
        // given
        User voter = createUser(1L, "voter@example.com", "투표자");
        User author = createUser(2L, "author@example.com", "작성자");
        Post post = Post.builder().title("제목").content("내용").author(author).build();
        ReflectionTestUtils.setField(post, "id", 1L);

        given(userRepository.findByEmail("voter@example.com")).willReturn(Optional.of(voter));
        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(voteRepository.findByUserIdAndPostId(1L, 1L)).willReturn(Optional.empty());
        given(voteRepository.save(any(Vote.class))).willAnswer(inv -> inv.getArgument(0));

        // when
        PostResponse response = postService.vote(1L, "DOWN", "voter@example.com");

        // then
        assertThat(response.getDownvotes()).isEqualTo(1);
    }

    @Test
    @DisplayName("동일 방향 중복 투표 시 BusinessException 발생")
    void duplicateVoteThrowsException() {
        // given
        User voter = createUser(1L, "voter@example.com", "투표자");
        User author = createUser(2L, "author@example.com", "작성자");
        Post post = Post.builder().title("제목").content("내용").author(author).build();
        ReflectionTestUtils.setField(post, "id", 1L);

        Vote existingVote = Vote.builder()
                .user(voter).post(post).voteType(Vote.VoteType.UP).build();

        given(userRepository.findByEmail("voter@example.com")).willReturn(Optional.of(voter));
        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(voteRepository.findByUserIdAndPostId(1L, 1L)).willReturn(Optional.of(existingVote));

        // when & then
        assertThatThrownBy(() -> postService.vote(1L, "UP", "voter@example.com"))
                .isInstanceOf(BusinessException.class);
    }
}
