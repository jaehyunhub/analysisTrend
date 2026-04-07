package backend.banner.service;

import backend.banner.domain.Banner;
import backend.banner.dto.BannerRequest;
import backend.banner.dto.BannerResponse;
import backend.banner.repository.BannerRepository;
import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BannerService {

    private final BannerRepository bannerRepository;

    @Cacheable(value = "banners", key = "'all'")
    public List<BannerResponse> findAll() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(BannerResponse::from).toList();
    }

    @Cacheable(value = "banners", key = "'active'")
    public List<BannerResponse> findActive() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(BannerResponse::from).toList();
    }

    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    public BannerResponse create(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .displayOrder(request.getDisplayOrder())
                .build();
        return BannerResponse.from(bannerRepository.save(banner));
    }

    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    public BannerResponse update(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        banner.update(request.getTitle(), request.getSubtitle(), request.getImageUrl(),
                request.isActive(), request.getDisplayOrder());
        return BannerResponse.from(banner);
    }

    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.ENTITY_NOT_FOUND);
        }
        bannerRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    public BannerResponse toggleActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        banner.toggleActive();
        return BannerResponse.from(banner);
    }
}
