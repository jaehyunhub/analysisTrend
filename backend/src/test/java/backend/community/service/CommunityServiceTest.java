package backend.community.service;

import backend.community.domain.Community;
import backend.community.dto.CommunityResponse;
import backend.community.dto.CreateCommunityRequest;
import backend.community.repository.CommunityRepository;
import backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    @Mock
    private CommunityRepository communityRepository;

    @InjectMocks
    private CommunityService communityService;

    @Test
    @DisplayName("커뮤니티 생성 성공")
    void createCommunity() {
        // given
        CreateCommunityRequest request = new CreateCommunityRequest();
        ReflectionTestUtils.setField(request, "name", "테스트커뮤니티");
        ReflectionTestUtils.setField(request, "description", "테스트 설명");

        Community community = Community.builder()
                .name("테스트커뮤니티")
                .description("테스트 설명")
                .build();
        ReflectionTestUtils.setField(community, "id", 1L);

        given(communityRepository.existsByName("테스트커뮤니티")).willReturn(false);
        given(communityRepository.save(any(Community.class))).willReturn(community);

        // when
        CommunityResponse response = communityService.create(request);

        // then
        assertThat(response.getName()).isEqualTo("테스트커뮤니티");
        assertThat(response.getDescription()).isEqualTo("테스트 설명");
    }

    @Test
    @DisplayName("중복 이름으로 커뮤니티 생성 시 BusinessException 발생")
    void createCommunityWithDuplicateNameThrowsException() {
        // given
        CreateCommunityRequest request = new CreateCommunityRequest();
        ReflectionTestUtils.setField(request, "name", "중복커뮤니티");

        given(communityRepository.existsByName("중복커뮤니티")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> communityService.create(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("커뮤니티 전체 목록 조회 성공")
    void findAllCommunities() {
        // given
        Community c1 = Community.builder().name("커뮤니티1").description("설명1").build();
        Community c2 = Community.builder().name("커뮤니티2").description("설명2").build();

        given(communityRepository.findAll()).willReturn(List.of(c1, c2));

        // when
        List<CommunityResponse> result = communityService.findAll();

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("커뮤니티1");
    }

    @Test
    @DisplayName("존재하지 않는 커뮤니티 조회 시 BusinessException 발생")
    void findByIdNotFound() {
        // given
        given(communityRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> communityService.findById(999L))
                .isInstanceOf(BusinessException.class);
    }
}
