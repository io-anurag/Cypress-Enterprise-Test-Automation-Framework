pipeline {
    agent {
        docker {
            image 'cypress/browsers:node-20.13.1-chrome-124.0.6367.207-1-ff-125.0.3-edge-124.0.2478.80-1'
            args '--shm-size=2g'  // Prevent Chrome from crashing in Docker
        }
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['qa', 'dev', 'staging', 'prod'],
            description: 'Target environment for test execution'
        )
        string(
            name: 'TAGS',
            defaultValue: 'smoke',
            description: 'Test tags to run: smoke | regression | api | ui'
        )
        booleanParam(
            name: 'RUN_PARALLEL',
            defaultValue: true,
            description: 'Run UI and API tests in parallel'
        )
    }

    environment {
        CYPRESS_ENV = "${params.ENVIRONMENT}"
        CYPRESS_TAGS = "${params.TAGS}"
        CYPRESS_USERNAME = credentials('cypress-username')
        CYPRESS_PASSWORD = credentials('cypress-password')
        NODE_VERSION = '20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Environment: ${params.ENVIRONMENT}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version && npm --version'
                sh 'npm ci --prefer-offline'
                sh 'npx cypress verify'
            }
        }

        stage('Code Quality') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('TypeScript') {
                    steps {
                        sh 'npm run type-check'
                    }
                }
                stage('Prettier') {
                    steps {
                        sh 'npm run format:check'
                    }
                }
            }
        }

        stage('Cypress Tests') {
            when {
                expression { params.RUN_PARALLEL == true }
            }
            parallel {
                stage('UI Tests') {
                    steps {
                        sh """
                            npx cypress run \
                                --headless \
                                --browser chrome \
                                --spec 'cypress/e2e/ui/**/*.cy.ts' \
                                --env tags="${params.TAGS}",ENVIRONMENT="${params.ENVIRONMENT}"
                        """
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'cypress/reports/videos/**/*.mp4', allowEmptyArchive: true
                        }
                        failure {
                            archiveArtifacts artifacts: 'cypress/reports/screenshots/**/*.png', allowEmptyArchive: true
                        }
                    }
                }
                stage('API Tests') {
                    steps {
                        sh """
                            npx cypress run \
                                --headless \
                                --browser chrome \
                                --spec 'cypress/e2e/api/**/*.cy.ts' \
                                --env tags="${params.TAGS}",ENVIRONMENT="${params.ENVIRONMENT}"
                        """
                    }
                }
            }
        }

        stage('Cypress Tests (Sequential)') {
            when {
                expression { params.RUN_PARALLEL == false }
            }
            steps {
                sh """
                    npx cypress run \
                        --headless \
                        --browser chrome \
                        --env tags="${params.TAGS}",ENVIRONMENT="${params.ENVIRONMENT}"
                """
            }
        }

        stage('Merge & Generate Report') {
            steps {
                sh 'npm run report:merge'
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'cypress/reports/mochawesome/html',
                reportFiles: '*.html',
                reportName: 'Cypress Test Report'
            ])
            junit allowEmptyResults: true, testResults: 'cypress/reports/mochawesome/*.xml'
        }
        failure {
            emailext(
                subject: "❌ Cypress Tests FAILED — ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <b>Build:</b> ${env.BUILD_URL}<br/>
                    <b>Branch:</b> ${env.BRANCH_NAME}<br/>
                    <b>Environment:</b> ${params.ENVIRONMENT}<br/>
                    <b>Tags:</b> ${params.TAGS}
                """,
                to: '$DEFAULT_RECIPIENTS',
                mimeType: 'text/html'
            )
        }
        cleanup {
            cleanWs()
        }
    }
}
