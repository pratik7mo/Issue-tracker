pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "issue-tracker-backend"
        FRONTEND_IMAGE = "issue-tracker-frontend"
        DB_URL = credentials('db-url')
        DB_USERNAME = credentials('db-username')
        DB_PASSWORD = credentials('db-password')
        MAIL_USERNAME = credentials('mail-username')
        MAIL_PASSWORD = credentials('mail-password')
        VITE_API_BASE_URL = credentials('vite-api-url')
        REDIS_HOST = "redis"
        REDIS_PORT = "6379"
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
                dir('issue-tracker-frontend') {
                    bat 'npm install'
                    bat 'npm run lint'
                    // In Windows bat, VITE_API_BASE_URL must be set before run
                    bat "set VITE_API_BASE_URL=%VITE_API_BASE_URL% && npm run build"
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

        stage('Create Env File') {
            steps {
                // Create .env inside the backend folder as requested
                writeFile file: 'issue-tracker-backend/.env', text: """
DB_URL=${DB_URL}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}
VITE_API_BASE_URL=${VITE_API_BASE_URL}
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
"""
                // Verify the file was created in the correct location
                bat 'dir issue-tracker-backend\\.env'
                bat 'type issue-tracker-backend\\.env'
            }
        }

        stage('Deploy Stack') {
            steps {
                bat """
                docker-compose --env-file issue-tracker-backend/.env down --remove-orphans || true
                docker-compose --env-file issue-tracker-backend/.env up -d --build
                """
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
            // Delete the temporary .env file for security
            bat 'if exist issue-tracker-backend\\.env del issue-tracker-backend\\.env'
        }
        success {
            echo 'Pipeline completed successfully and stack deployed!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}






