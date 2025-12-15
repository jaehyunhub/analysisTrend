package backend.user.domain;

import backend.global.baseEntity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Column
    private String password;

    @Enumerated(EnumType.STRING) // 문자열로 저장(USER, ADMIN)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING) // 문자열로 저장(GOOGLE, KAKAO, NAVER..)
    private AuthProvider provider;

    private String providerId;

    @Builder
    public User(String email, String nickname, String password, Role role, AuthProvider provider, String providerId) {
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.role = role;
        this.provider = provider;
        this.providerId = providerId;
    }

    // 소셜 로그인 시 정보 업데이트용 메서드
    public User update(String nickname, String providerId) {
        this.nickname = nickname;
        this.providerId = providerId;
        return this;
    }

    public String getRoleKey() {
        return this.role.getKey();
    }
}
