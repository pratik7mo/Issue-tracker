package com.issuetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
public class IssueTrackerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(IssueTrackerBackendApplication.class, args);
	}

}
