package backend.user.service;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import backend.user.domain.User;
import backend.user.dto.CustomOAuth2User;
import backend.user.dto.OAuthAttributes;
import backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        // 1. DTO로 변환
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName,
                oAuth2User.getAttributes());

        // ★ [눈으로 확인] 여기서 로그가 찍히면 데이터가 잘 넘어온 겁니다!
        log.info("======================================================");
        log.info("🎉 [OAuth2 로그인 요청] Provider: {}", registrationId);
        log.info("🎉 [유저 정보] email: {}, nickname: {}", attributes.getEmail(), attributes.getNickname());
        log.info("======================================================");

        // 2. 저장 또는 업데이트
        User user = saveOrUpdate(attributes);

        // ★ DB 저장 후 ID 확인
        log.info("[DB 저장 완료] User ID: {}, Role: {}", user.getId(), user.getRole());

        // 3. User 엔티티를 품은 Principal 반환
        return new CustomOAuth2User(user, attributes.getAttributes());
    }

    private User saveOrUpdate(OAuthAttributes attributes) {
        User user = userRepository.findByProviderAndProviderId(attributes.getProvider(), attributes.getProviderId())
                .map(entity -> entity.update(attributes.getNickname(), attributes.getProviderId()))
                .orElse(attributes.toEntity());
        return userRepository.save(user);
    }

}
