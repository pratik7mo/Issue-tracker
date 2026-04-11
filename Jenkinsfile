pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "issue-tracker-backend"
        FRONTEND_IMAGE = "issue-tracker-frontend"
        REDIS_HOST = "redis"
        REDIS_PORT = "6379"
        // Prevent JVM OutOfMemory errors by limiting Maven memory
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
                checkout scm
            }
        }

        stage('Backend: Build & Test') {
            steps {
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

        stage('Backend: Docker Build') {
            steps {
                dir('issue-tracker-backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ."
                }
            }
        }

        stage('Frontend: Docker Build') {
            steps {
                withCredentials([string(credentialsId: 'vite-api-url', variable: 'VITE_URL')]) {
                    dir('issue-tracker-frontend') {
                        sh "docker build --build-arg VITE_API_BASE_URL=${VITE_URL} -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ."
                    }
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
                    // Verify the file was created
                    sh 'ls -la .env'
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
                sh "docker-compose --env-file .env down --remove-orphans"
                sh "docker-compose --env-file .env up -d --build"
            }
        }

        stage('Test AWS') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh "aws sts get-caller-identity"
                }
            }
        }

        stage('AWS: Push to ECR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    // Log in to ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    
                    // Tag and Push Backend
                    sh "docker tag ${BACKEND_IMAGE}:latest ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest"
                    sh "docker tag ${BACKEND_IMAGE}:latest ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:latest"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    
                    // Tag and Push Frontend
                    sh "docker tag ${FRONTEND_IMAGE}:latest ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker tag ${FRONTEND_IMAGE}:latest ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                }
            }
        }

        stage('AWS: Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh """
                        scp -o StrictHostKeyChecking=no .env docker-compose.prod.yml ubuntu@13.201.97.103:~/issue-tracker/

                        ssh -o StrictHostKeyChecking=no ubuntu@13.201.97.103 << EOF
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                        export ECR_REGISTRY=043505372362.dkr.ecr.ap-south-1.amazonaws.com

                        # LOGIN TO ECR on EC2
                        aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin \\\$ECR_REGISTRY

                        cd issue-tracker
                        docker-compose -f docker-compose.prod.yml down
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                        EOF
                        """
                    }
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







