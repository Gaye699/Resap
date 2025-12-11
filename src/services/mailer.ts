'use server'

import { Mailer } from 'nodemailer-react'
import { ContactEmail } from '@/components/Contact/ContactEmail'
import { NewStructureEmail, type NewStructureEmailParams } from '@/components/NewStructure/NewStructureEmail'
import type { ContactFields } from '@/components/Contact/ContactFormSection'

const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD } = process.env

if (!MAIL_HOST || !MAIL_PORT || !MAIL_USERNAME || !MAIL_PASSWORD) {
  throw new Error('Mail env vars needed (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD).')
}
const mailer = Mailer({
  transport: {
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
    },
  },
  defaults: {
    from: { name: 'Resap', address: 'noreply@resap.fr' },
  },
}, {
  ContactEmail,
  NewStructureNotification: NewStructureEmail,
})

export const sendContactEmail = async (contact: ContactFields) => {
  // Honeypot check: if the hidden field has a value, it's a bot
  if (contact.website) {
    throw new Error('Bot detected.')
  }

  // Validate submission time: reject if submitted in less than 10 seconds
  if (contact.formLoadedAt) {
    const submissionTime = Date.now() - contact.formLoadedAt
    const MINIMUM_SUBMISSION_TIME = 10

    if (submissionTime < MINIMUM_SUBMISSION_TIME) {
      throw new Error('Bot detected.')
    }
  }

  return mailer.send('ContactEmail', contact, { to: 'contact@resap.fr' })
}

export const sendNewStructureNotification = async (data: NewStructureEmailParams) => {
  mailer.send('NewStructureNotification', data, {
    to: 'contact@resap.fr',
  })
}
