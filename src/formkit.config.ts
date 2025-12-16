import { defaultConfig } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'

// Tailwind class definitions for each input type
const textClasses: Record<string, string> = {
  outer: 'mb-5',
  label: 'block mb-1 font-medium text-surface-800',
  inner: 'relative',
  input:
    'w-full rounded border border-surface-300 px-4 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  help: 'text-sm text-surface-300 mt-1',
  messages: 'list-none p-0 mt-1',
  message: 'text-red-500 text-sm',
}

const textareaClasses: Record<string, string> = {
  ...textClasses,
  input:
    'w-full rounded border border-surface-300 px-4 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-32',
}

const selectClasses: Record<string, string> = {
  ...textClasses,
  input:
    'w-full rounded border border-surface-300 px-4 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white',
}

const boxClasses: Record<string, string> = {
  outer: 'mb-5',
  fieldset: 'border-0 p-0 m-0',
  legend: 'block mb-2 font-medium text-surface-800',
  wrapper: 'flex items-center gap-2 cursor-pointer',
  inner: 'flex items-center',
  input: 'h-4 w-4 rounded border-surface-300 text-primary focus:ring-primary/20 cursor-pointer',
  label: 'text-surface-800 cursor-pointer',
  help: 'text-sm text-surface-300 mt-1',
  messages: 'list-none p-0 mt-1',
  message: 'text-red-500 text-sm',
}

const buttonClasses: Record<string, string> = {
  outer: 'mb-5',
  input:
    'w-full sm:w-auto rounded bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
}

const formClasses: Record<string, string> = {
  form: 'space-y-2',
  messages: 'list-none p-0 mb-4',
  message: 'text-red-500 text-sm',
}

// Map input types to their class definitions
const classMap: Record<string, Record<string, string>> = {
  text: textClasses,
  email: textClasses,
  password: textClasses,
  number: textClasses,
  url: textClasses,
  tel: textClasses,
  search: textClasses,
  date: textClasses,
  time: textClasses,
  textarea: textareaClasses,
  select: selectClasses,
  checkbox: boxClasses,
  radio: boxClasses,
  submit: buttonClasses,
  button: buttonClasses,
  form: formClasses,
}

// rootClasses function that FormKit calls for each section of each input
function rootClasses(sectionKey: string, node: FormKitNode): Record<string, boolean> {
  const type = node.props.type || 'text'
  const classes = classMap[type] || textClasses
  const classString = classes[sectionKey] || ''

  // Convert space-separated class string to Record<string, boolean>
  return classString.split(' ').reduce(
    (acc, className) => {
      if (className) acc[className] = true
      return acc
    },
    {} as Record<string, boolean>
  )
}

export default defaultConfig({
  config: {
    rootClasses,
  },
})
