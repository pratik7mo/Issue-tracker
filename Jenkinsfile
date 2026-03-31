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
                    sh './mvnw clean package'
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
                    sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${env.BUILD_NUMBER} ."
                }
            }
        }

        stage('Frontend: Build & Lint') {
            steps {
                dir('issue-tracker-frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend: Docker Build') {
            steps {
                dir('issue-tracker-frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ."
                }
            }
        }

        stage('Deploy Stack') {
            steps {
                sh """
                docker-compose down || true
                DB_URL=${DB_URL} \
                DB_USERNAME=${DB_USERNAME} \
                DB_PASSWORD=${DB_PASSWORD} \
                MAIL_USERNAME=${MAIL_USERNAME} \
                MAIL_PASSWORD=${MAIL_PASSWORD} \
                docker-compose up -d
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
        success {
            echo 'Pipeline completed successfully and stack deployed!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}

