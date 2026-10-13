package com.smartfamily.financial.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
public class DynamicDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DynamicDataSourceConfig.class);

    @Value("${spring.datasource.username:root}")
    private String defaultUsername;

    @Value("${spring.datasource.password:root}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. If explicit cloud URL is provided (SPRING_DATASOURCE_URL or DATABASE_URL)
        String envDbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (envDbUrl == null || envDbUrl.isBlank()) {
            envDbUrl = System.getenv("DATABASE_URL");
        }

        if (envDbUrl != null && !envDbUrl.isBlank()) {
            log.info("Detected cloud database URL from environment variables. Using: {}", envDbUrl);
            config.setJdbcUrl(envDbUrl);
            config.setUsername(System.getenv().getOrDefault("SPRING_DATASOURCE_USERNAME", defaultUsername));
            config.setPassword(System.getenv().getOrDefault("SPRING_DATASOURCE_PASSWORD", defaultPassword));
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            return new HikariDataSource(config);
        }

        // 2. Check if running on Render cloud environment
        boolean isRender = System.getenv("RENDER") != null || System.getenv("RENDER_SERVICE_ID") != null;

        // 3. Check if local MySQL port 3306 is reachable
        boolean isLocalMySqlAvailable = !isRender && isPortReachable("localhost", 3306, 1200);

        if (isLocalMySqlAvailable) {
            log.info("Local MySQL detected on localhost:3306. Connecting to MySQL database...");
            config.setJdbcUrl("jdbc:mysql://localhost:3306/smart_family_financial_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true");
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        } else {
            log.info("Running on Render or local MySQL port 3306 is not accessible. Auto-activating file-backed H2 database.");
            config.setJdbcUrl("jdbc:h2:file:./data/smartfamily;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;AUTO_SERVER=TRUE");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        return new HikariDataSource(config);
    }

    private boolean isPortReachable(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
