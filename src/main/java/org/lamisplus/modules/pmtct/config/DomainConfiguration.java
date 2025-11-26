package org.lamisplus.modules.pmtct.config;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.TransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import javax.sql.DataSource;
import java.util.Optional;

@Slf4j
@Configuration
@EnableJpaRepositories(
        transactionManagerRef = "pmtctTransactionManger",
        basePackages = "org.lamisplus.modules.pmtct.repository"

)
@EnableTransactionManagement
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class DomainConfiguration {

    private final DataSource dataSource;
    private final UserService userService;

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    public DomainConfiguration(DataSource dataSource, UserService userService) {
        this.dataSource = dataSource;
        this.userService = userService;
    }


    @Bean(name = "pmtctTransactionManger")
    @Primary
    public TransactionManager transactionManager() {
        JpaTransactionManager jpaTransactionManager = new JpaTransactionManager();
        jpaTransactionManager.setDataSource(dataSource);
        jpaTransactionManager.setEntityManagerFactory(entityManagerFactory);
        return jpaTransactionManager;
    }

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            try {
                Optional<User> currentUser = userService.getUserWithRoles();
                if (currentUser.isPresent()) {
                    return Optional.of(currentUser.get().getUserName());
                }
            } catch (Exception e) {
                log.error("Error getting current user for auditing", e);
            }
            return Optional.of("system");
        };
    }

}
