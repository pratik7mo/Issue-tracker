# 30 Comprehensive Jenkins CI/CD & Deployment Interview Questions
## Project: Issue Tracking System | High-Impact DevOps Scenarios

This guide presents 30 real-world, scenario-based interview questions and answers derived from the Issue Tracking System project. It is optimized for senior-level DevOps and Full-Stack interviews.

---

### Category 1: Jenkins & Pipeline Architecture

**1. Scenario: Your Jenkins UI is successful but shows no stage boxes. What happened and how do you fix it?**
*   **Experience-First Answer**: This typically occurs when the Jenkinsfile isn't strictly following the Declarative DSL. In my project, I encountered this when logic was leaking outside the `pipeline` or `stage` blocks. I resolved it by refactoring the script into a pure **Declarative Pipeline**, ensuring every step lived within a defined `stage`. This restored full visualization in Blue Ocean and the Status Page.

**2. Why did you choose a local Jenkinsfile over a Jenkins Shared Library for this project?**
*   **Experience-First Answer**: For this standalone Issue Tracking System, a local Jenkinsfile provided **Pipeline-as-Code** proximity, allowing developers to see and modify the build logic alongside the code. While Shared Libraries are great for multi-repo standardization, the local file allowed for rapid experimentation with specific AWS deployment scripts.

**3. How did you implement real-time build triggers?**
*   **Experience-First Answer**: I moved away from "Poll SCM" to **GitHub Webhooks**. This reduced latency from minutes to seconds. Whenever a developer pushes to the `dev1` branch, GitHub sends a POST request to the Jenkins `/github-webhook/` endpoint, triggering the pipeline instantly.

**4. How can you optimize the build time if the Frontend and Backend builds take too long?**
*   **Experience-First Answer**: I would implement **Parallel Stages**. In a Declarative Pipeline, I can wrap the Backend Maven build and the Frontend NPM build inside a `parallel` block. This allows the Jenkins agent (if it has resources) to run both processes simultaneously, potentially cutting the build time in half.

**5. Why use `agent any` instead of a specific node label?**
*   **Experience-First Answer**: In the current single-server setup, `agent any` ensures the pipeline runs on the first available executor. As the infrastructure scales, I would transition to labels (e.g., `agent { label 'docker-node' }`) to ensure the build only runs on nodes with the Docker daemon installed.

**6. How do you handle CI/CD across multiple branches (main, dev, feature)?**
*   **Experience-First Answer**: I used a **Multibranch Pipeline**. Jenkins automatically detects any branch containing a `Jenkinsfile` and creates a corresponding sub-job. This allows us to have different deployment logic for `main` (production) and `dev1` (staging) within the same file using `when` blocks.

---

### Category 2: Docker & Container Orchestration

**7. Scenario: Your React Docker image is 1GB. How do you reduce it?**
*   **Experience-First Answer**: I implemented **Multi-stage Builds**. Stage 1 uses a heavy Node image to compile the TypeScript/React code. Stage 2 copies only the production files (`/dist`) into a lightweight **Nginx Alpine** image. This reduced the final image size from 1GB to under 30MB, speeding up the push/pull process to AWS ECR.

**8. How do the Backend and PostgreSQL containers communicate if they are separate?**
*   **Experience-First Answer**: They are connected via a **Custom Bridge Network** in Docker Compose. I define the database service as `db` and the backend service as `api`. The backend then uses `jdbc:postgresql://db:5432/` as the connection string. Docker's internal DNS handles the name-to-IP translation.

**9. What is your strategy for image versioning in ECR?**
*   **Experience-First Answer**: I never rely on the `latest` tag in production pipelines. Instead, I tag images with the Jenkins `${env.BUILD_NUMBER}`. This provides a clear audit trail. If a deployment fails, I know exactly which build caused it, and I can perform an immediate rollback by pulling the previous build's tag.

**10. How do you inject environment-specific URLs into the React frontend during a build?**
*   **Experience-First Answer**: Since React is a client-side library, `.env` variables must be available at build time. I used Docker `--build-arg VITE_API_BASE_URL=${API_URL}` during the `docker build` command. This "bakes" the correct production API endpoint into the static assets.

**11. How do you ensure database data isn't lost when a container is restarted on EC2?**
*   **Experience-First Answer**: I implemented **Docker Volumes**. In the `docker-compose.yml`, I mapped a host directory (e.g., `/data/postgres`) to the container's data path. This ensures that even if the container is destroyed and recreated, the underlying PostgreSQL data remains safe on the EC2 disk.

**12. How do you ensure the Backend API doesn't start before the Database is ready?**
*   **Experience-First Answer**: While Docker Compose has `depends_on`, it only checks if the container is *started*, not *ready*. I used a **Healthcheck** in the PostgreSQL container and a custom "wait-for-it" script (or Spring Boot's internal retry logic) to ensure the API only attempts to connect once the DB is fully accepting traffic.

---

### Category 3: Security & Credential Handling

**13. How did you automate the generation of the production `.env` file?**
*   **Experience-First Answer**: I wrote a Jenkins step that uses the `writeFile` utility. It reads secrets from the **Jenkins Credentials Store** and formats them into a `.env` file structure. This file is then securely transferred to EC2 via SCP, ensuring that at no point are these secrets stored in the Git repository.

**14. Scenario: A developer accidentally prints a secret to the Jenkins log. How do you mitigate this?**
*   **Experience-First Answer**: First, I would use the Jenkins **Mask Passwords** plugin or the native secret masking in `withCredentials`. If a leak occurs, I must immediately rotate the secret (e.g., change the AWS Key or DB Password) and then clean the build history to remove the sensitive logs.

**15. How do you automate the AWS login for ECR in a script?**
*   **Experience-First Answer**: I used the command: `aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${REGISTRY}`. This pipe-based authentication avoids writing passwords to the disk and is standard for secure CI/CD automation.

**16. What IAM permissions does your Jenkins agent need?**
*   **Experience-First Answer**: Following the **Principle of Least Privilege**, the IAM user for Jenkins should only have `AmazonEC2ContainerRegistryPowerUser` (to push images) and specific EC2 permissions to facilitate deployment. It should not have full Administrator access.

**17. Scenario: Your new API endpoint returns a 401 error in production. Where do you look?**
*   **Experience-First Answer**: I check the **Spring Security Configuration**. In my project, I had to ensure that the new path was added to the `permitAll()` list or that the `AntPathRequestMatcher` was correctly configured to handle the `/api/` prefix used by the Nginx proxy.

**18. How do you deploy to EC2 without exposing your SSH private key?**
*   **Experience-First Answer**: I use the **SSH Agent Plugin** in Jenkins. I wrap the deployment steps in an `sshagent(['ec2-ssh-key'])` block. This makes the key available to the SSH/SCP commands in memory, but it never persists as a file on the Jenkins workspace.

---

### Category 4: Deployment & Infrastructure

**19. How do you ensure the production server always has the latest Docker Compose file?**
*   **Experience-First Answer**: As part of the deployment stage, I use `scp` to copy the `docker-compose.prod.yml` from the workspace to the EC2 home directory. This ensures the infrastructure definition moves with the code, allowing me to update container configurations (like memory limits or environment variables) automatically.

**20. How do you verify a deployment was successful programmatically?**
*   **Experience-First Answer**: After running `docker-compose up -d`, I added an automated diagnostics step: `docker-compose ps` to check container status, followed by a `curl -I localhost:80` to verify that the Nginx frontend is actually serving traffic. If these fail, the Jenkins build is marked as "Failed".

**21. Describe the difference between your current deployment and a Zero-Downtime strategy.**
*   **Experience-First Answer**: My current setup uses `docker-compose down && up`, which causes a few seconds of downtime. For zero-downtime, I would implement **Blue-Green Deployment** or use `docker-compose up -d --no-deps --build <service_name>`, which restarts services individually without stopping the entire stack.

**22. Scenario: Your SCP transfer fails with "Broken Pipe". How do you troubleshoot?**
*   **Experience-First Answer**: I first check if the EC2 instance is reachable (SecGroup/IP). If it's a timeout, it might be due to a large file transfer. I would check the SSH configuration on the host (`ClientAliveInterval`) or simplify the transfer by only moving the zipped configuration files.

**23. How do you handle EC2 Security Groups in your CI/CD flow?**
*   **Experience-First Answer**: The EC2 instance must have an Inbound rule allowing **Port 22 (SSH)** from the Jenkins Server's static IP. For the application, I open **Port 80/443** (HTTP/S) to the public, while keeping database ports (5432) restricted to the internal Docker network only.

**24. Why did you use Nginx as a Reverse Proxy in the frontend container?**
*   **Experience-First Answer**: It allowed me to solve **CORS issues** and simplify frontend code. By proxying `/api` to the backend service over the internal Docker network, the frontend thinks it's talking to the same origin. This removes the need for hardcoded backend IPs in the React code.

---

### Category 5: Failure Recovery & Troubleshooting

**25. Scenario: Your backend build fails with an "Out of Memory" error. What is the first fix?**
*   **Experience-First Answer**: I check the `MAVEN_OPTS` environment variable in the Jenkinsfile. I often have to set `-Xmx512m` to ensure the JVM has enough heap space to compile a large Spring Boot project without crashing the Jenkins agent.

**26. How do you resolve a mismatch where the Frontend uses `/api` but the Backend doesn't expect it?**
*   **Experience-First Answer**: This is a routing issue. I either adjust the **Nginx `proxy_pass`** to rewrite the URL (removing `/api` before it hits the backend) or I configure the Spring Boot **`server.servlet.context-path`** to match the `/api` prefix.

**27. What do you do if your Docker build fails with "Step X: No such file or directory"?**
*   **Experience-First Answer**: I check the **Dockerfile `COPY` commands** and the `.dockerignore` file. Often, a necessary file (like a config file or a build artifact) is either not present in the workspace or is being explicitly ignored, causing the Docker daemon to fail the context transfer.

**28. How do you troubleshoot a "Database Connection Refused" error happening only in production?**
*   **Experience-First Answer**: I check the **Networking** and **Environment Variables**. I verify that the API is using the correct Docker network name for the DB and that the `SPRING_DATASOURCE_URL` was correctly injected into the `.env` file during the deployment stage.

**29. Scenario: CORS works on your local machine but fails on EC2. Why?**
*   **Experience-First Answer**: The **Allowed Origins** list in `SecurityConfig.java` likely only contains `localhost`. I would need to update the configuration to include the EC2 public domain or IP, or better yet, use the Nginx reverse proxy to eliminate the cross-origin requirement entirely.

**30. How do you prevent your Jenkins server from running out of disk space?**
*   **Experience-First Answer**: I implemented the `cleanWs()` step in the `post { always { ... } }` block. This ensures that after every build, the temporary Docker images, Maven artifacts, and `.env` files are deleted, preventing the server from crashing due to workspace bloat.
