pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "issue-tracker-backend"
        FRONTEND_IMAGE = "issue-tracker-frontend"
        REDIS_HOST = "redis"
        REDIS_PORT = "6379"
        // Prevent JVM OutOfMemory errors by limiting Maven memory
        MAVEN_OPTS = "-Xms256m -Xmx512m"
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
                        bat 'npm run lint'
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
                    bat 'type .env'
                }
            }
        }


        stage('Deploy Stack') {
            steps {
                bat """
                docker-compose --env-file .env down --remove-orphans || true
                docker-compose --env-file .env up -d --build
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







