import { useState, useCallback } from 'react'
import { z } from 'zod'

type FormErrors<T> = {
  [K in keyof T]?: string
}

interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  onSubmit?: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const validateField = useCallback((field: keyof T) => {
    if (!validationSchema) return true

    try {
      const fieldSchema = validationSchema.shape[field as string]
      if (fieldSchema) {
        fieldSchema.parse(values[field])
        setErrors(prev => ({ ...prev, [field]: undefined }))
        return true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message }))
      }
      return false
    }
    return true
  }, [validationSchema, values])

  const validateForm = useCallback(() => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: FormErrors<T> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof T
            formErrors[field] = err.message
          }
        })
        setErrors(formErrors)
      }
      return false
    }
  }, [validationSchema, values])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm() || !onSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm, onSubmit, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }, [initialValues])

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(field, e.target.value as T[keyof T])
    },
    onBlur: () => {
      setFieldTouched(field)
      validateField(field)
    },
    error: touched[field] ? errors[field] : undefined,
  }), [values, errors, touched, setValue, setFieldTouched, validateField])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  }
}