package backend.community.service;

import backend.community.domain.Community;
import backend.community.dto.CommunityResponse;
import backend.community.dto.CreateCommunityRequest;
import backend.community.repository.CommunityRepository;
import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityService {

    private final CommunityRepository communityRepository;

    @Cacheable(value = "communities", key = "'all'")
    public List<CommunityResponse> findAll() {
        return communityRepository.findAll().stream()
                .map(CommunityResponse::from)
                .collect(Collectors.toList());
    }

    public CommunityResponse findById(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        return CommunityResponse.from(community);
    }

    @Transactional
    @CacheEvict(value = "communities", allEntries = true)
    public CommunityResponse create(CreateCommunityRequest request) {
        if (communityRepository.existsByName(request.getName())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return CommunityResponse.from(communityRepository.save(community));
    }
}
