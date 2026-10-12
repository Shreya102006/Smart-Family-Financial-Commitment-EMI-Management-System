@echo off
set MAVEN_EXE=%~dp0..\..\maven\apache-maven-3.9.6\bin\mvn.cmd
if exist "%MAVEN_EXE%" (
    call "%MAVEN_EXE%" %*
) else (
    mvn %*
)
