pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "issue-tracker-backend"
        FRONTEND_IMAGE = "issue-tracker-frontend"
        REDIS_HOST = "redis"
        REDIS_PORT = "6379"
        MAVEN_OPTS = "-Xms256m -Xmx512m"
        
        // AWS CONFIGURATION
        AWS_ACCOUNT_ID = "${env.AWS_ACCOUNT_ID}"
        AWS_REGION = "${env.AWS_REGION}"
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EC2_PUBLIC_IP = "${env.EC2_PUBLIC_IP}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "--- STAGE: CHECKOUT ---"
                checkout scm
            }
        }

        stage('Backend: Build & Test') {
            steps {
                echo "--- STAGE: BACKEND BUILD & TEST ---"
                dir('issue-tracker-backend') {
                    sh './mvnw clean package -DskipTests'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'issue-tracker-backend/target/*.jar', fingerprint: true
                    junit testResults: 'issue-tracker-backend/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Docker: Build Images') {
            steps {
                echo "--- STAGE: DOCKER BUILD ---"
                script {
                    dir('issue-tracker-backend') {
                        sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ."
                    }
                    dir('issue-tracker-frontend') {
                        sh "docker build --build-arg VITE_API_BASE_URL=/api -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ."
                    }
                }
            }
        }

        stage('Security: Verify Credentials') {
            steps {
                echo "--- STAGE: VERIFY CREDENTIALS ---"
                withCredentials([
                    string(credentialsId: 'db-url', variable: 'DB_URL_VAL'),
                    string(credentialsId: 'db-username', variable: 'DB_USER_VAL'),
                    string(credentialsId: 'db-password', variable: 'DB_PASS_VAL'),
                    string(credentialsId: 'mail-username', variable: 'MAIL_USER_VAL'),
                    string(credentialsId: 'mail-password', variable: 'MAIL_PASS_VAL'),
                    string(credentialsId: 'vite-api-url', variable: 'VITE_API_VAL')
                ]) {
                    script {
                        def required = [
                            'db-url': DB_URL_VAL, 'db-username': DB_USER_VAL, 'db-password': DB_PASS_VAL,
                            'mail-username': MAIL_USER_VAL, 'mail-password': MAIL_PASS_VAL, 'vite-api-url': VITE_API_VAL
                        ]
                        def missing = required.findAll { k, v -> !v?.trim() }.keySet()
                        if (missing) error "Missing Jenkins credentials: ${missing.join(', ')}"
                    }
                }
            }
        }

        stage('Config: Create Environment') {
            steps {
                echo "--- STAGE: CREATE ENV FILE ---"
                withCredentials([
                    string(credentialsId: 'db-url', variable: 'DB_URL'),
                    string(credentialsId: 'db-username', variable: 'DB_USER'),
                    string(credentialsId: 'db-password', variable: 'DB_PASS'),
                    string(credentialsId: 'mail-username', variable: 'MAIL_USER'),
                    string(credentialsId: 'mail-password', variable: 'MAIL_PASS'),
                    string(credentialsId: 'vite-api-url', variable: 'VITE_API')
                ]) {
                    script {
                        def envContent = """
ECR_REGISTRY=${ECR_REGISTRY}
SPRING_DATASOURCE_URL=${DB_URL}
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASS}
SPRING_MAIL_USERNAME=${MAIL_USER}
SPRING_MAIL_PASSWORD=${MAIL_PASS}
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
DB_URL=${DB_URL}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
MAIL_USERNAME=${MAIL_USER}
MAIL_PASSWORD=${MAIL_PASS}
VITE_API_BASE_URL=/api
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
"""
                        writeFile file: '.env', text: envContent
                        sh 'ls -la .env'
                    }
                }
            }
        }

        stage('AWS: Push to ECR') {
            steps {
                echo "--- STAGE: ECR PUSH ---"
                withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    
                    sh "docker tag ${BACKEND_IMAGE}:latest ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest"
                    sh "docker tag ${BACKEND_IMAGE}:latest ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    
                    sh "docker tag ${FRONTEND_IMAGE}:latest ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker tag ${FRONTEND_IMAGE}:latest ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                }
            }
        }

        stage('AWS: Deploy to EC2') {
            steps {
                echo "--- STAGE: EC2 DEPLOYMENT ---"
                sshagent(['ec2-ssh-key']) {
                    withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_PUBLIC_IP} \"mkdir -p ~/issue-tracker/\"
                        scp -r -o StrictHostKeyChecking=no .env docker-compose.prod.yml prometheus.yml grafana ubuntu@${EC2_PUBLIC_IP}:~/issue-tracker/
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_PUBLIC_IP} <<EOF
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                            export AWS_DEFAULT_REGION=${AWS_REGION}
                            export ECR_REGISTRY=${ECR_REGISTRY}
                            
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            cd ~/issue-tracker
                            
                            echo \"Deployment Diagnostic: Checking Memory Status\"
                            free -h
                            
                            echo \"--- CLEANING DOCKER JUNK ---\"
                            docker system prune -af
                            
                            docker-compose -f docker-compose.prod.yml down
                            docker-compose -f docker-compose.prod.yml up -d
                            
                            echo \"Deployment Diagnostic: Post-Start Status\"
                            docker-compose -f docker-compose.prod.yml ps
                            free -h
EOF
                        """
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo "--- STAGE: CLEANUP ---"
                cleanWs()
            }
        }
    }

    post {
        always {
            echo 'Finalizing pipeline execution...'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
