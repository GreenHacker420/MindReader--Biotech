import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, email, company, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Save to database
    const contactLead = await prisma.contactLead.create({
      data: {
        fullName: name,
        email,
        company: company || null,
        message,
        status: 'NEW',
      },
    });

    // Send email using Nodemailer SMTP if configured, otherwise log
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, CONTACT_TO } = process.env;
    const smtpConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

    if (smtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      const fromAddress = SMTP_FROM || 'MindReaderBio <noreply@mindreaderbio.tech>';
      const toAddress = CONTACT_TO || 'contact@mindreaderbio.tech';

      try {
        // Notify team
        await transporter.sendMail({
          from: fromAddress,
          to: toAddress,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Contact Form Submission</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Submitted on: ${new Date().toLocaleString()}</p>
            </div>`,
        });

        // Confirmation to sender
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: 'Thank you for contacting MindReaderBio',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Thank you for reaching out</h2>
              <p>Hi ${name},</p>
              <p>We&apos;ve received your message and our team will get back to you within 24 hours.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Your message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p>Best regards,<br/>The MindReaderBio Team</p>
            </div>`,
        });
      } catch (emailError) {
        console.error('SMTP email sending error:', emailError);
        console.log('Contact form submission (email failed):', {
          name,
          email,
          company,
          message,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.log('Contact form submission (SMTP not configured):', {
        name,
        email,
        company,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { message: 'Thank you for your message. We\'ll get back to you soon' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
