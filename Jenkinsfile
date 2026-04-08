pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "issue-tracker-backend"
        FRONTEND_IMAGE = "issue-tracker-frontend"
        REDIS_HOST = "redis"
        REDIS_PORT = "6379"
        // Prevent JVM OutOfMemory errors by limiting Maven memory
        MAVEN_OPTS = "-Xms256m -Xmx512m"

        // AWS CONFIGURATION (Set these in Jenkins Global Environment Variables)
        AWS_ACCOUNT_ID = "${env.AWS_ACCOUNT_ID}"
        AWS_REGION = "${env.AWS_REGION}"
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EC2_PUBLIC_IP = "${env.EC2_PUBLIC_IP}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Build & Test') {
            steps {
                dir('issue-tracker-backend') {
                    // Use mvnw.cmd for Windows agents
                    bat 'mvnw.cmd clean package -DskipTests'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'issue-tracker-backend/target/*.jar', fingerprint: true
                    junit testResults: 'issue-tracker-backend/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Backend: Docker Build') {
            steps {
                dir('issue-tracker-backend') {
                    bat "docker build -t %BACKEND_IMAGE%:latest -t %BACKEND_IMAGE%:%BUILD_NUMBER% ."
                }
            }
        }

        stage('Frontend: Build & Lint') {
            steps {
                withCredentials([string(credentialsId: 'vite-api-url', variable: 'VITE_URL')]) {
                    dir('issue-tracker-frontend') {
                        bat 'npm install'
                        bat "set VITE_API_BASE_URL=%VITE_URL% && npm run build"
                    }
                }
            }
        }

        stage('Frontend: Docker Build') {
            steps {
                dir('issue-tracker-frontend') {
                    bat "docker build -t %FRONTEND_IMAGE%:latest -t %FRONTEND_IMAGE%:%BUILD_NUMBER% ."
                }
            }
        }

        stage('Verify Required Credentials') {
            steps {
                withCredentials([
                    string(credentialsId: 'db-url', variable: 'DB_URL_CHECK'),
                    string(credentialsId: 'db-username', variable: 'DB_USER_CHECK'),
                    string(credentialsId: 'db-password', variable: 'DB_PASS_CHECK'),
                    string(credentialsId: 'mail-username', variable: 'MAIL_USER_CHECK'),
                    string(credentialsId: 'mail-password', variable: 'MAIL_PASS_CHECK'),
                    string(credentialsId: 'vite-api-url', variable: 'VITE_API_CHECK')
                ]) {
                    script {
                        def required = [
                            'db-url'       : DB_URL_CHECK,
                            'db-username'  : DB_USER_CHECK,
                            'db-password'  : DB_PASS_CHECK,
                            'mail-username': MAIL_USER_CHECK,
                            'mail-password': MAIL_PASS_CHECK,
                            'vite-api-url' : VITE_API_CHECK
                        ]
                        def missing = required.findAll { id, value -> !value?.trim() }.keySet()
                        if (!missing.isEmpty()) {
                            error "Missing/blank Jenkins credential values for IDs: ${missing.join(', ')}"
                        }
                        echo "All required Jenkins credentials are present."
                    }
                }
            }
        }

        stage('Create Env File') {
            steps {
                withCredentials([
                    string(credentialsId: 'db-url', variable: 'DB_URL'),
                    string(credentialsId: 'db-username', variable: 'DB_USER'),
                    string(credentialsId: 'db-password', variable: 'DB_PASS'),
                    string(credentialsId: 'mail-username', variable: 'MAIL_USER'),
                    string(credentialsId: 'mail-password', variable: 'MAIL_PASS'),
                    string(credentialsId: 'vite-api-url', variable: 'VITE_API')
                ]) {
                    script {
                        def requiredSecrets = [
                            DB_URL      : DB_URL,
                            DB_USERNAME : DB_USER,
                            DB_PASSWORD : DB_PASS,
                            MAIL_USERNAME: MAIL_USER,
                            MAIL_PASSWORD: MAIL_PASS,
                            VITE_API_BASE_URL: VITE_API
                        ]
                        def missingSecrets = requiredSecrets.findAll { key, value -> !value?.trim() }.keySet()
                        if (!missingSecrets.isEmpty()) {
                            error "Missing required Jenkins credentials values: ${missingSecrets.join(', ')}"
                        }

                        def envContent = """
DB_URL=${DB_URL}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
MAIL_USERNAME=${MAIL_USER}
MAIL_PASSWORD=${MAIL_PASS}
VITE_API_BASE_URL=${VITE_API}
REDIS_HOST=${env.REDIS_HOST}
REDIS_PORT=${env.REDIS_PORT}

"""
                        writeFile file: '.env', text: envContent
                    }
                    // Verify the file was created in the root
                    bat 'dir .env'
                }
            }
        }


        stage('Deploy Stack (Local)') {
            when {
                expression { env.DEPLOY_LOCAL == 'true' }
            }
            steps {
                script {
                    def envVars = readProperties file: '.env'
                    def requiredComposeVars = ['DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'MAIL_USERNAME', 'MAIL_PASSWORD']
                    def missingComposeVars = requiredComposeVars.findAll { key -> !envVars[key]?.trim() }
                    if (!missingComposeVars.isEmpty()) {
                        error "Deployment aborted: required .env values are missing or blank: ${missingComposeVars.join(', ')}"
                    }
                }
                bat 'docker-compose --env-file .env down --remove-orphans'
                bat 'docker-compose --env-file .env up -d --build'
            }
        }

        stage('Test AWS') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    bat '''
                    aws sts get-caller-identity
                    '''
                }
            }
        }

        stage('AWS: Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    // Log in to ECR (Windows bat)
                    bat "aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%"
                    
                    // Tag and Push Backend
                    bat "docker tag %BACKEND_IMAGE%:latest %ECR_REGISTRY%/%BACKEND_IMAGE%:latest"
                    bat "docker tag %BACKEND_IMAGE%:latest %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER%"
                    bat "docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:latest"
                    bat "docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER%"
                    
                    // Tag and Push Frontend
                    bat "docker tag %FRONTEND_IMAGE%:latest %ECR_REGISTRY%/%FRONTEND_IMAGE%:latest"
                    bat "docker tag %FRONTEND_IMAGE%:latest %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER%"
                    bat "docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:latest"
                    bat "docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER%"
                }
            }
        }

        stage('AWS: Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'KEY')]) {
                    // 1. Fix permissions on the temporary key file (Required for Windows SSH)
                    bat '''
                        icacls %KEY% /inheritance:r
                        icacls %KEY% /grant:r "%USERNAME%:F"
                    '''
                    
                    // 2. Copy both .env and docker-compose.prod.yml to the EC2 using the protected key
                    bat 'scp -o StrictHostKeyChecking=no -i %KEY% .env docker-compose.prod.yml ubuntu@%EC2_PUBLIC_IP%:~/issue-tracker/'
                    
                    // 3. Run remote commands to restart the app stack
                    bat '''
                        ssh -o StrictHostKeyChecking=no -i %KEY% ubuntu@%EC2_PUBLIC_IP% "
                            mkdir -p ~/issue-tracker
                            cd ~/issue-tracker
                            
                            # Log in to ECR on remote
                            aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%
                            
                            # Set ECR_REGISTRY for docker-compose and pull
                            export ECR_REGISTRY=%ECR_REGISTRY%
                            docker-compose -f docker-compose.prod.yml --env-file .env pull
                            
                            # Restart stack
                            docker-compose -f docker-compose.prod.yml --env-file .env down --remove-orphans
                            docker-compose -f docker-compose.prod.yml --env-file .env up -d
                        "
                    '''
                }
            }
        }

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
    }

    post {
        always {
            echo 'Finalizing pipeline execution...'
            // TEMPORARY: Commented out for debugging so you can manually check the .env file
            // bat 'if exist .env del .env'
        }
        success {
            echo 'Pipeline completed successfully and stack deployed!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}







