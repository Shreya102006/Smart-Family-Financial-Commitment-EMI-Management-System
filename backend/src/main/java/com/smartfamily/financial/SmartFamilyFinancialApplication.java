package com.smartfamily.financial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartFamilyFinancialApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartFamilyFinancialApplication.class, args);
    }
}
