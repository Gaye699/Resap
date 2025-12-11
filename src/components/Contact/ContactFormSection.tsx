'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { sendContactEmail } from '@/services/mailer'
import { PrimaryButton } from '../Buttons'
import { FormField, FormInput, FormTextarea } from '../Forms'

// @see https://www.emailregex.com
// eslint-disable-next-line no-control-regex
const emailRegexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export type ContactFields = {
  message: string,
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  organization: string,
  website?: string, // honeypot field
  formLoadedAt?: number, // timestamp when form was loaded
}

const Form = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFields>()
  const [formLoadedAt] = useState(() => Math.floor(Date.now() / 1000))

  const onSubmit = async (contact: ContactFields) => {
    try {
      // Send the form load timestamp to the server for validation
      await sendContactEmail({
        ...contact,
        formLoadedAt,
      })
      reset()
      toast.success(
        'Votre message a été envoyé. \n\nNous reviendrons vers vous dans les plus brefs délais.',
      )
    } catch (_e) {
      toast.error(
        'Nous n\'avons pas pu envoyer votre message en raison d\'une erreur technique. \n\nMerci de nous contacter par un autre moyen.',
      )
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-8">
      {/* Honeypot field - hidden with CSS to prevent bot detection */}
      <input
        type="text"
        {...register('website')}
        tabIndex={-1}
        autoComplete="off"
        placeholder="Website"
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      <FormField className="sm:col-span-6" name="message" required error={errors.message && 'Le champ est requis.'} label="Message">
        <FormTextarea
          id="message"
          error={!!errors.message}
          defaultValue=""
          {...register('message', { required: true })}
        />
      </FormField>

      <FormField className="sm:col-span-3" name="firstName" required error={errors.firstName && 'Le champ est requis.'} label="Prénom">
        <FormInput
          type="text"
          id="firstName"
          autoComplete="given-name"
          {...register('firstName')}
        />
      </FormField>

      <FormField className="sm:col-span-3" name="lastName" required error={errors.lastName && 'Le champ est requis.'} label="Nom">
        <FormInput
          type="text"
          id="lastName"
          autoComplete="family-name"
          {...register('lastName')}
        />
      </FormField>

      <FormField className="sm:col-span-2" name="phone" required error={errors.phone && 'Le champ est requis.'} label="Téléphone">
        <FormInput
          type="tel"
          id="phone"
          autoComplete="tel"
          {...register('phone')}
        />
      </FormField>

      <FormField className="sm:col-span-4" name="email" required error={errors.email && 'Merci de renseigner un email valide.'} label="Email">
        <FormInput
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...register('email', { pattern: emailRegexp })}
        />
      </FormField>

      <FormField className="sm:col-span-6" name="organization" label="Structure / Organisation">
        <FormInput
          type="text"
          id="organization"
          autoComplete="organization"
          {...register('organization')}
        />
      </FormField>

      <div className="sm:col-span-6">
        <p className="text-sm text-gray-500">
          Nous vous remercions de renseigner vos informations de contact si vous souhaitez que nous revenions vers vous.
          N&apos;hésitez pas à préciser dans le corps du message toute information qui pourrait être utile au traitement de votre demande.
        </p>
      </div>

      <div className="sm:col-span-6">
        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-xs text-base font-medium"
        >
          {isSubmitting
            && <span aria-hidden="true" className="-ml-1 mr-3 w-5 h-5 border-2 border-transparent border-l-white rounded-full animate-spin" />}
          Envoyer
        </PrimaryButton>
      </div>
    </form>
  )
}

export const ContactFormSection = () => (
  <div className="py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
    <div className="relative max-w-xl mx-auto">
      <svg
        className="absolute left-full  translate-x-1/2"
        width={404}
        height={404}
        fill="none"
        viewBox="0 0 404 404"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="85737c0e-0916-41d7-917f-596dc7edfa27"
            x={0}
            y={0}
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
          >
            <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
          </pattern>
        </defs>
        <rect width={404} height={404} fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
      </svg>
      <svg
        className="absolute right-full bottom-0  -translate-x-1/2"
        width={404}
        height={404}
        fill="none"
        viewBox="0 0 404 404"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="85737c0e-0916-41d7-917f-596dc7edfa27"
            x={0}
            y={0}
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
          >
            <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
          </pattern>
        </defs>
        <rect width={404} height={404} fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
      </svg>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-default sm:text-4xl">Nous contacter</h1>
        <p className="mt-4 text-lg leading-6 text-gray-500">
          Vous avez une remarque ou une question, n’hésitez pas à remplir le formulaire ci-dessous, les porteurs du projet RESAP vous répondront.
        </p>
      </div>
      <div className="mt-12">
        <Form />
      </div>
    </div>
  </div>
)
