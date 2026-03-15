package backend.user.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import backend.user.domain.AuthProvider;
import backend.user.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // 소설 로그인으로 가입된 유저인지 확인하는 메서드
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);

    // 일반 로그인용 메서드
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
