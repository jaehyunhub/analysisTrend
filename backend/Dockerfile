# (빌드 환경)
# 1. 베이스 이미지를 가져오는데, 이 단계의 이름을 'builder'라고 짓습니다.
FROM amazoncorretto:17 AS builder
WORKDIR /app

# 2. 빌드에 필요한 파일들(Gradle 설정, 소스 코드)을 복사한다
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# 3. 윈도우에서 저장된 경우 실행 권한이 없을 수 있으므로 권한을 준다.
RUN chmod +x gradlew

# 4. Gradle로 빌드를 수행하여 jar 파일을 만든다.
# 이 과정이 끝나면 build.libs 폴더 안에 jar 파일이 생성된다.
RUN ./gradlew bootJar -x test

# (실행 환경)
# 1. 새로운 이미지(Amazon Corretto 17)를 다시 시작한다.
FROM amazoncorretto:17
WORKDIR /app

# 2. 핵심 builder 단계에서 생성된 jar 파일만 복사해온다.
# 소스 코드(src), Gradle 파일 등은 가져오지 않는다.
COPY --from=builder /app/build/libs/*.jar app.jar

#3. 포트 열고 실행
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
