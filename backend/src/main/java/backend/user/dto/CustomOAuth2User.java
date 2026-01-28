package backend.user.dto;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import backend.user.domain.User;
import lombok.Getter;

@Getter
public class CustomOAuth2User implements OAuth2User {

    private final User user;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    /*
     * User 엔티티에 있는 Role()를 꺼내서
     * 스프링 시큐리티가 아는 타입으로 변경한다.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 자바에서 단 하나의 요소만 들어있는 수정 불가능한 세트를 만든다.
        return Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey()));
    }

    @Override
    public String getName() {
        return user.getEmail();
    }

}
