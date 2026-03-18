package backend.youtube.service;

import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import backend.youtube.domain.YoutubeVideo;
import backend.youtube.dto.YoutubeVideoRequest;
import backend.youtube.dto.YoutubeVideoResponse;
import backend.youtube.repository.YoutubeVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class YoutubeVideoService {

    private final YoutubeVideoRepository youtubeVideoRepository;

    public List<YoutubeVideoResponse> findAll() {
        return youtubeVideoRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(YoutubeVideoResponse::from).toList();
    }

    @Transactional
    public YoutubeVideoResponse create(YoutubeVideoRequest request) {
        YoutubeVideo video = YoutubeVideo.builder()
                .title(request.getTitle())
                .videoId(request.getVideoId())
                .thumbnailUrl(request.getThumbnailUrl())
                .duration(request.getDuration())
                .viewCount(request.getViewCount())
                .displayOrder(request.getDisplayOrder())
                .build();
        return YoutubeVideoResponse.from(youtubeVideoRepository.save(video));
    }

    @Transactional
    public YoutubeVideoResponse update(Long id, YoutubeVideoRequest request) {
        YoutubeVideo video = youtubeVideoRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        video.update(request.getTitle(), request.getVideoId(), request.getThumbnailUrl(),
                request.getDuration(), request.getViewCount(), request.getDisplayOrder());
        return YoutubeVideoResponse.from(video);
    }

    @Transactional
    public void delete(Long id) {
        if (!youtubeVideoRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.ENTITY_NOT_FOUND);
        }
        youtubeVideoRepository.deleteById(id);
    }
}
