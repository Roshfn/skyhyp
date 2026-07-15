package com.skyhyp.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp);
}