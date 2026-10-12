@echo off
echo ========================================================
echo Starting Smart Family Financial System - Spring Boot Backend
echo ========================================================
cd /d "%~dp0backend"
set MAVEN_EXE=%~dp0..\maven\apache-maven-3.9.6\bin\mvn.cmd
if exist "%MAVEN_EXE%" (
    call "%MAVEN_EXE%" spring-boot:run
) else (
    call mvn spring-boot:run
)
pause
