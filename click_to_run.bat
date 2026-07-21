@echo off
title CAD Viewer Local Server
echo =======================================================
echo   DANG KHOI DONG MAY CHU CUC BO CHO CAD VIEW...
echo =======================================================
echo.
echo   * Trinh duyet se tu dong mo sau vai giay.
echo   * De tat may chu, hay dong cua so terminal nay.
echo.
echo =======================================================
start "" cmd /c "npx http-server -o -p 8080"
