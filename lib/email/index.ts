import { siteConfig } from '@/config/site'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT ?? '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// 读取模板文件
function getTemplate (templateName: string): string {
  const templatePath = path.join(process.cwd(), 'lib', 'email', 'template', `${templateName}.html`)
  return fs.readFileSync(templatePath, 'utf8')
}

// 替换模板中的变量
function replaceTemplateVariables (template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

// 发送评论通知给博客作者
export async function sendCommentNotification (comment: any, postTitle: string, postUrl: string) {
  try {
    // 获取作者通知模板
    const template = getTemplate('author')

    // 替换模板变量
    const html = replaceTemplateVariables(template, {
      blogUrl: process.env.SITE_URL ?? '',
      blogName: process.env.SITE_NAME ?? siteConfig.name,
      author: comment.author,
      permalink: postUrl,
      title: postTitle,
      text: comment.text
    })

    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `您在 [${siteConfig.name}] 发表的文章有新评论（${postTitle}）`,
      html
    })
    console.log('评论通知邮件已发送给博客作者')
    return true
  } catch (error) {
    console.error('发送评论通知邮件失败:', error)
    return false
  }
}

// 发送回复通知给评论者
export async function sendReplyNotification (originalComment: any, replyComment: any, postTitle: string, postUrl: string) {
  try {
    // 获取回复通知模板
    const template = getTemplate('reply')

    // 替换模板变量
    const html = replaceTemplateVariables(template, {
      blogUrl: process.env.SITE_URL ?? '',
      blogName: process.env.SITE_NAME ?? siteConfig.name,
      author: originalComment.author,
      permalink: postUrl,
      title: postTitle,
      text: originalComment.text,
      replyAuthor: replyComment.author,
      replyText: replyComment.text,
      commentUrl: postUrl
    })

    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.EMAIL_USER}>`,
      to: originalComment.email,
      subject: `您在 [${siteConfig.name}] 的评论有了新的回复！`,
      html
    })
    console.log('回复通知邮件已发送给评论者')
    return true
  } catch (error) {
    console.error('发送回复通知邮件失败:', error)
    return false
  }
}

// 发送评论审核通过通知给评论者
export async function sendCommentApprovedNotification (comment: any, postTitle: string, postUrl: string) {
  try {
    // 获取评论审核通过通知模板
    const template = getTemplate('approved')

    // 替换模板变量
    const html = replaceTemplateVariables(template, {
      blogUrl: process.env.SITE_URL ?? '',
      blogName: process.env.SITE_NAME ?? siteConfig.name,
      author: comment.author,
      permalink: postUrl,
      title: postTitle,
      text: comment.text
    })

    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.EMAIL_USER}>`,
      to: comment.email,
      subject: `您在 [${siteConfig.name}] 的评论已通过审核！`,
      html
    })
    console.log('评论审核通过通知邮件已发送给评论者')
    return true
  } catch (error) {
    console.error('发送评论审核通过通知邮件失败:', error)
    return false
  }
}
