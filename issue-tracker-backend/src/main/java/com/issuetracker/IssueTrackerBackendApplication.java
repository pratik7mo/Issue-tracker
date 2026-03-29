package com.issuetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IssueTrackerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(IssueTrackerBackendApplication.class, args);
	}

}
