package backend.global.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * 공개 읽기 전용 API에 CDN 캐시 헤더를 추가합니다.
 * Cloudflare/Railway Fastly 엣지가 응답을 캐시해 한국→싱가포르 왕복 지연을 줄입니다.
 */
@Component
public class CdnCacheFilter extends OncePerRequestFilter {

    private static final Set<String> CACHEABLE_PREFIXES = Set.of(
            "/api/v1/banners",
            "/api/v1/schedules",
            "/api/v1/communities",
            "/api/v1/youtube",
            "/api/v1/products"
    );

    // 브라우저 1분 / CDN 엣지 5분 캐시
    private static final String CACHE_HEADER = "public, max-age=60, s-maxage=300, stale-while-revalidate=60";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if ("GET".equalsIgnoreCase(request.getMethod()) && isCacheable(request.getRequestURI())) {
            response.setHeader("Cache-Control", CACHE_HEADER);
        }
        filterChain.doFilter(request, response);
    }

    private boolean isCacheable(String uri) {
        return CACHEABLE_PREFIXES.stream().anyMatch(uri::startsWith);
    }
}
